import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getSupabaseClient, isCmsConfigured, isCmsPartiallyConfigured } from '../lib/supabaseClient';
import {
  deleteContent,
  fetchAdminMedia,
  fetchAdminPortfolio,
  fetchAdminVenues,
  fetchDashboardData,
  fetchVenueCategories,
  publishContent,
  reorderContent,
  reorderSocialWallRow,
  requestMediaDeletion,
  savePortfolioDraft,
  saveVenueDraft,
  setContentStatus,
  updateMediaAltText,
  type PortfolioDraftInput,
  type VenueDraftInput,
} from '../services/cmsRepository';
import { uploadCmsImage } from '../services/mediaUploads';
import { mediaUrl, type CmsContentType, type MediaAsset, type PortfolioRecord, type VenueCategory, type VenueRecord } from '../types/cms';
import { useWebsiteImageEditor } from '../contexts/websiteImageEditorContext';

type AdminView = 'dashboard' | 'portfolio' | 'venues' | 'media';
type MfaStep = 'checking' | 'sign-in' | 'recovery-request' | 'recovery-update' | 'enroll' | 'challenge' | 'denied' | 'ready';

const emptyPortfolio: PortfolioDraftInput = {
  title: '',
  slug: '',
  description: '',
  category: 'wedding',
  guest_capacity: null,
  duration: null,
  event_date: null,
  location: null,
  budget: null,
  tags: [],
  awards: [],
  photographer: null,
  featured: false,
  sort_order: 0,
  social_wall_row: null,
  social_wall_sort_order: 0,
  mediaIds: [],
};

const emptyVenue: VenueDraftInput = {
  name: '',
  slug: '',
  category_id: '',
  subtitle: null,
  description: '',
  guest_capacity: 100,
  amenities: [],
  location: null,
  featured: false,
  sort_order: 0,
  price_amount: null,
  price_currency: 'INR',
  price_type: 'contact_for_quote',
  price_note: null,
  mediaIds: [],
};

function messageFrom(error: unknown): string {
  const message = error instanceof Error ? error.message : 'The requested CMS operation failed.';
  if (/Could not find the table 'public\.(venues|venue_categories|venue_media|portfolio_items|portfolio_media|media_assets|site_image_slots|admin_activity)' in the schema cache/i.test(message)) {
    return 'Admin sign-in succeeded, but the CMS relations are not available through the Supabase API. Check the live migration history, exposed schema, grants, and schema cache before applying any migration.';
  }
  return message;
}

function splitList(value: string): string[] {
  return value.split(',').map((entry) => entry.trim()).filter(Boolean);
}

function AdminCms() {
  const [session, setSession] = useState<Session | null>(null);
  const [step, setStep] = useState<MfaStep>(isCmsConfigured ? 'checking' : 'sign-in');
  const stepRef = useRef(step);
  const [view, setView] = useState<AdminView>('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioRecord[]>([]);
  const [venues, setVenues] = useState<VenueRecord[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [venueCategories, setVenueCategories] = useState<VenueCategory[]>([]);
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [dashboard, setDashboard] = useState<Awaited<ReturnType<typeof fetchDashboardData>> | null>(null);
  const [portfolioForm, setPortfolioForm] = useState<PortfolioDraftInput>(emptyPortfolio);
  const [venueForm, setVenueForm] = useState<VenueDraftInput>(emptyVenue);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFilePreviewUrls, setSelectedFilePreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<CmsContentType | null>(null);
  const [editingPublished, setEditingPublished] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { enableEditMode } = useWebsiteImageEditor();

  const adminEmail = session?.user.email ?? '';
  const currentRecords = useMemo(() => view === 'portfolio' ? portfolio : venues, [view, portfolio, venues]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const loadData = useCallback(async () => {
    const [portfolioRows, venueRows, mediaRows, dashboardData, categories] = await Promise.all([
      fetchAdminPortfolio(),
      fetchAdminVenues(),
      fetchAdminMedia(),
      fetchDashboardData(),
      fetchVenueCategories(true),
    ]);
    const previewEntries = await Promise.all(mediaRows.map(async (asset): Promise<[string, string]> => {
      if (asset.provider === 'external') return [asset.id, asset.external_url ?? ''];
      if (asset.state === 'published') return [asset.id, mediaUrl(asset)];
      if (asset.state === 'staging' && asset.bucket && asset.object_path) {
        const { data, error: signedUrlError } = await getSupabaseClient()
          .storage.from(asset.bucket).createSignedUrl(asset.object_path, 3600);
        if (signedUrlError) throw signedUrlError;
        return [asset.id, data.signedUrl];
      }
      return [asset.id, ''];
    }));
    setPortfolio(portfolioRows);
    setVenues(venueRows);
    setMedia(mediaRows);
    setVenueCategories(categories);
    setMediaUrls(Object.fromEntries(previewEntries));
    setDashboard(dashboardData);
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith('/admin/portfolio')) setView('portfolio');
    else if (location.pathname.startsWith('/admin/venues')) setView('venues');
    else if (location.pathname.startsWith('/admin/media')) setView('media');
    else if (location.pathname.startsWith('/admin/dashboard')) setView('dashboard');
  }, [location.pathname]);

  useEffect(() => {
    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setSelectedFilePreviewUrls(previewUrls);
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  useEffect(() => {
    if ((step === 'sign-in' || step === 'denied') && location.pathname !== '/admin/login') {
      navigate('/admin/login', { replace: true });
    }
  }, [location.pathname, navigate, step]);

  useEffect(() => {
    if (!isCmsConfigured) {
      setStep('sign-in');
      return;
    }

    let active = true;
    const client = getSupabaseClient();
    const { data: subscription } = client.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') {
        setError(null);
        setNotice(null);
        setStep('recovery-update');
        navigate('/admin/recovery', { replace: true });
      }
    });
    void client.auth.getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) throw sessionError;
        setSession(data.session);
        if (location.pathname === '/admin/recovery' && data.session) setStep('recovery-update');
        else if (!data.session) setStep('sign-in');
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(messageFrom(cause));
          setStep('sign-in');
        }
      });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (stepRef.current === 'recovery-update' || stepRef.current === 'recovery-request') return;
    if (!session) {
      setStep('sign-in');
      return;
    }

    let active = true;
    setStep('checking');
    setError(null);
    void (async () => {
      const client = getSupabaseClient();
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError) throw userError;
      if (userData.user?.app_metadata.cms_role !== 'admin') {
        if (active) setStep('denied');
        return;
      }

      const { data: assurance, error: assuranceError } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assuranceError) throw assuranceError;
      if (assurance.currentLevel === 'aal2') {
        if (!active) return;
        setStep('ready');
        navigate('/admin/dashboard', { replace: true });
        try {
          await loadData();
        } catch (cause) {
          if (active) setError(messageFrom(cause));
        }
        return;
      }

      const { data: factorData, error: factorsError } = await client.auth.mfa.listFactors();
      if (factorsError) throw factorsError;
      const verifiedFactor = factorData.totp.find((factor) => factor.status === 'verified');
      if (verifiedFactor) {
        if (active) {
          setFactorId(verifiedFactor.id);
          setStep('challenge');
        }
        return;
      }

      for (const factor of factorData.all.filter((candidate) => candidate.factor_type === 'totp' && candidate.status === 'unverified')) {
        const { error: unenrollError } = await client.auth.mfa.unenroll({ factorId: factor.id });
        if (unenrollError) throw unenrollError;
      }

      const { data: enrollment, error: enrollmentError } = await client.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'JP Events CMS',
      });
      if (enrollmentError) throw enrollmentError;
      if (active) {
        setFactorId(enrollment.id);
        setQrCode(enrollment.totp.qr_code);
        setManualSecret(enrollment.totp.secret);
        setStep('enroll');
      }
    })().catch((cause: unknown) => {
      if (active) {
        setError(messageFrom(cause));
        setStep('sign-in');
      }
    });

    return () => { active = false; };
  }, [session, loadData, navigate]);

  const runAction = async (action: () => Promise<void>, successMessage?: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      if (successMessage) setNotice(successMessage);
    } catch (cause) {
      setError(messageFrom(cause));
    } finally {
      setBusy(false);
    }
  };

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runAction(async () => {
      const { error: signInError } = await getSupabaseClient().auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      setPassword('');
    });
  };

  const handlePasswordRecoveryRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runAction(async () => {
      const { error: recoveryError } = await getSupabaseClient().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/recovery`,
      });
      if (recoveryError) throw recoveryError;
      setNotice('If an administrator account matches that email, a recovery link will arrive shortly.');
    });
  };

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < 12) {
      setError('Choose a password with at least 12 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('The passwords do not match.');
      return;
    }

    await runAction(async () => {
      const { error: updateError } = await getSupabaseClient().auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      const { error: signOutError } = await getSupabaseClient().auth.signOut();
      if (signOutError) throw signOutError;
      setNewPassword('');
      setConfirmNewPassword('');
      setNotice('Password updated. Sign in again and complete administrator verification.');
      navigate('/admin/login', { replace: true });
    });
  };

  const verifyMfa = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runAction(async () => {
      const client = getSupabaseClient();
      const { data: challenge, error: challengeError } = await client.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await client.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: verificationCode.trim(),
      });
      if (verifyError) throw verifyError;
      setVerificationCode('');
      setQrCode('');
      setManualSecret('');
      const { data: assurance, error: assuranceError } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assuranceError) throw assuranceError;
      if (assurance.currentLevel !== 'aal2') throw new Error('Multi-factor verification did not establish the required AAL2 session.');
      setStep('ready');
      await loadData();
    });
  };

  const resetEditor = () => {
    setEditingType(null);
    setEditingPublished(false);
    setPortfolioForm(emptyPortfolio);
    setVenueForm(emptyVenue);
    setSelectedFiles([]);
    setUploadProgress(null);
  };

  const editPortfolio = (item: PortfolioRecord) => {
    setView('portfolio');
    setEditingType('portfolio');
    setEditingPublished(item.status === 'published');
    setPortfolioForm({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      category: item.category,
      guest_capacity: item.guest_capacity,
      duration: item.duration,
      event_date: item.event_date,
      location: item.location,
      budget: item.budget,
      tags: item.tags ?? [],
      awards: item.awards ?? [],
      photographer: item.photographer,
      featured: item.featured,
      sort_order: item.sort_order,
      social_wall_row: item.social_wall_row,
      social_wall_sort_order: item.social_wall_sort_order,
      mediaIds: [...(item.portfolio_media ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((entry) => entry.media_id),
    });
  };

  const editVenue = (venue: VenueRecord) => {
    setView('venues');
    setEditingType('venue');
    setEditingPublished(venue.status === 'published');
    setVenueForm({
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      category_id: venue.category_id,
      subtitle: venue.subtitle,
      description: venue.description,
      guest_capacity: venue.guest_capacity,
      amenities: venue.amenities ?? [],
      location: venue.location,
      featured: venue.featured,
      sort_order: venue.sort_order,
      price_amount: venue.price_amount,
      price_currency: venue.price_currency,
      price_type: venue.price_type,
      price_note: venue.price_note,
      mediaIds: [...(venue.venue_media ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((entry) => entry.media_id),
    });
  };

  const saveContent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingPublished && !window.confirm('Saving this published item as a draft will remove it from the public website until it is published again. Continue?')) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    setUploadProgress(selectedFiles.length ? 0 : null);
    try {
      let id: string;
      let mediaIds: string[];
      if (editingType === 'venue' || view === 'venues') {
        if (!venueForm.category_id) throw new Error('Select an active homepage category before saving the venue.');
        if (venueForm.price_type !== 'contact_for_quote' && (venueForm.price_amount === null || venueForm.price_amount < 0)) {
          throw new Error('Enter a non-negative public price or select Contact for quote.');
        }
        const draft = { ...venueForm, mediaIds: venueForm.mediaIds };
        id = await saveVenueDraft(draft);
        mediaIds = [...draft.mediaIds];
        for (const [index, file] of selectedFiles.entries()) {
          const asset = await uploadCmsImage(file, 'venue', id, (progress) => {
            setUploadProgress(Math.round(((index + progress / 100) / selectedFiles.length) * 100));
          });
          mediaIds.push(asset.id);
        }
        if (selectedFiles.length) await saveVenueDraft({ ...draft, id, mediaIds });
      } else {
        if (portfolioForm.social_wall_sort_order < 0 || !Number.isInteger(portfolioForm.social_wall_sort_order)) {
          throw new Error('Social wall order must be a non-negative whole number.');
        }
        const draft = { ...portfolioForm, mediaIds: portfolioForm.mediaIds };
        id = await savePortfolioDraft(draft);
        mediaIds = [...draft.mediaIds];
        for (const [index, file] of selectedFiles.entries()) {
          const asset = await uploadCmsImage(file, 'portfolio', id, (progress) => {
            setUploadProgress(Math.round(((index + progress / 100) / selectedFiles.length) * 100));
          });
          mediaIds.push(asset.id);
        }
        if (selectedFiles.length) await savePortfolioDraft({ ...draft, id, mediaIds });
      }
      setNotice('Draft saved. Publish it explicitly when it is ready to appear on the website.');
      resetEditor();
      await loadData();
    } catch (cause) {
      setError(messageFrom(cause));
    } finally {
      setBusy(false);
      setUploadProgress(null);
    }
  };

  const publish = (type: CmsContentType, id: string) =>
    runAction(async () => {
      await publishContent(type, id);
      await loadData();
    }, 'Content published.');

  const updateStatus = (type: CmsContentType, id: string, status: 'draft' | 'archived') =>
    runAction(async () => {
      await setContentStatus(type, id, status);
      await loadData();
    }, status === 'draft' ? 'Content moved to drafts.' : 'Content archived.');

  const removeContent = (type: CmsContentType, id: string) => {
    if (!window.confirm('Permanently delete this content record? Linked media is retained for safe cleanup.')) return;
    void runAction(async () => {
      await deleteContent(type, id);
      await loadData();
    }, 'Content deleted.');
  };

  const shiftRecord = (type: CmsContentType, index: number, offset: -1 | 1) => {
    const records = type === 'portfolio' ? portfolio : venues;
    const ordered = [...records].sort((a, b) => a.sort_order - b.sort_order);
    const destination = index + offset;
    if (destination < 0 || destination >= ordered.length) return;
    [ordered[index], ordered[destination]] = [ordered[destination], ordered[index]];
    void runAction(async () => {
      await reorderContent(type, ordered.map((record) => record.id));
      await loadData();
    }, 'Display order updated.');
  };

  const shiftSocialWallRecord = (row: 1 | 2 | 3, index: number, offset: -1 | 1) => {
    const ordered = portfolio
      .filter((record) => record.social_wall_row === row)
      .sort((a, b) => a.social_wall_sort_order - b.social_wall_sort_order || a.sort_order - b.sort_order);
    const destination = index + offset;
    if (destination < 0 || destination >= ordered.length) return;
    [ordered[index], ordered[destination]] = [ordered[destination], ordered[index]];
    void runAction(async () => {
      await reorderSocialWallRow(row, ordered.map((record) => record.id));
      await loadData();
    }, `Social wall row ${row} order updated.`);
  };

  const removeMedia = (asset: MediaAsset) => {
    if (!window.confirm(`Request safe deletion of "${asset.original_filename}"? Referenced media cannot be removed.`)) return;
    void runAction(async () => {
      await requestMediaDeletion(asset.id);
      await loadData();
    }, 'Media cleanup was queued.');
  };

  const navButton = (target: AdminView, label: string) => (
    <button
      type="button"
      onClick={() => {
        resetEditor();
        setView(target);
        setError(null);
        navigate(`/admin/${target}`);
      }}
      className={`rounded-lg px-3 py-2 text-sm font-medium ${view === target ? 'bg-rose-700 text-white' : 'text-slate-700 hover:bg-rose-50'}`}
    >
      {label}
    </button>
  );

  if (step === 'checking') {
    return <main className="mx-auto max-w-xl p-8 text-center" role="status">Checking administrator access…</main>;
  }

  if (step === 'recovery-request') {
    return (
      <main className="mx-auto min-h-screen max-w-lg px-4 py-16">
        <form className="space-y-5 rounded-2xl border border-rose-100 bg-white p-8 shadow-sm" onSubmit={(event) => void handlePasswordRecoveryRequest(event)}>
          <Link to="/admin/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-rose-700">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to sign in
          </Link>
          <p className="text-sm font-semibold uppercase tracking-widest text-rose-700">JP Events CMS</p>
          <h1 className="text-2xl font-semibold text-slate-900">Reset your password</h1>
          <p className="text-sm text-slate-600">Enter your administrator email. If it matches an account, we’ll send a secure recovery link.</p>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <button disabled={busy || !isCmsConfigured} className="w-full rounded-lg bg-rose-700 px-4 py-3 font-semibold text-white disabled:opacity-50">
            {busy ? 'Sending…' : 'Send recovery link'}
          </button>
          {notice && <p className="text-sm text-emerald-800" role="status">{notice}</p>}
          {error && <p className="text-sm text-rose-800" role="alert">{error}</p>}
        </form>
      </main>
    );
  }

  if (step === 'recovery-update') {
    return (
      <main className="mx-auto min-h-screen max-w-lg px-4 py-16">
        <form className="space-y-5 rounded-2xl border border-rose-100 bg-white p-8 shadow-sm" onSubmit={(event) => void handlePasswordUpdate(event)}>
          <p className="text-sm font-semibold uppercase tracking-widest text-rose-700">JP Events CMS</p>
          <h1 className="text-2xl font-semibold text-slate-900">Choose a new password</h1>
          <label className="block text-sm font-medium text-slate-700">
            New password
            <input required minLength={12} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Confirm new password
            <input required minLength={12} type="password" autoComplete="new-password" value={confirmNewPassword} onChange={(event) => setConfirmNewPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          {error && <p className="text-sm text-rose-800" role="alert">{error}</p>}
          <button disabled={busy} className="w-full rounded-lg bg-rose-700 px-4 py-3 font-semibold text-white disabled:opacity-50">
            {busy ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </main>
    );
  }

  if (step === 'sign-in' || step === 'denied') {
    return (
      <main className="mx-auto min-h-screen max-w-lg px-4 py-16">
        <div className="rounded-2xl border border-rose-100 bg-white p-8 shadow-sm">
          <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-rose-700">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to website
          </Link>
          <p className="text-sm font-semibold uppercase tracking-widest text-rose-700">JP Events</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Content administration</h1>
          {!isCmsConfigured && (
            <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900" role="alert">
              {isCmsPartiallyConfigured ? 'CMS configuration is incomplete.' : 'CMS is not configured.'} Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then provision an administrator through Supabase.
            </p>
          )}
          {step === 'denied' ? (
            <div className="mt-6">
              <p className="text-sm text-rose-800" role="alert">This account is not authorized for JP Events CMS administration.</p>
              <button type="button" disabled={busy} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50" onClick={() => void runAction(async () => {
                const { error: signOutError } = await getSupabaseClient().auth.signOut();
                if (signOutError) throw signOutError;
              })}>
                Sign out
              </button>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={(event) => void handleSignIn(event)}>
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Password
                <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <button type="button" className="text-sm font-medium text-rose-700 underline-offset-4 hover:underline" onClick={() => { setError(null); setNotice(null); setStep('recovery-request'); }}>
                Forgot password?
              </button>
              <p className="text-xs text-slate-600">Administrator access is granted by invitation. Account provisioning is controlled by an authorized project owner.</p>
              <button disabled={busy || !isCmsConfigured} className="w-full rounded-lg bg-rose-700 px-4 py-3 font-semibold text-white disabled:opacity-50">
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          )}
          {notice && <p className="mt-4 text-sm text-emerald-800" role="status">{notice}</p>}
          {error && <p className="mt-4 text-sm text-rose-800" role="alert">{error}</p>}
        </div>
      </main>
    );
  }

  if (step === 'enroll' || step === 'challenge') {
    return (
      <main className="mx-auto min-h-screen max-w-lg px-4 py-16">
        <form className="space-y-5 rounded-2xl border border-rose-100 bg-white p-8 shadow-sm" onSubmit={(event) => void verifyMfa(event)}>
          <p className="text-sm font-semibold uppercase tracking-widest text-rose-700">JP Events CMS</p>
          <h1 className="text-2xl font-semibold text-slate-900">{step === 'enroll' ? 'Set up authenticator MFA' : 'Verify administrator sign-in'}</h1>
          {step === 'enroll' && qrCode && (
            <div className="space-y-3 text-sm text-slate-700">
              <p>Scan this QR code with an authenticator app, then enter its current six-digit code.</p>
              <img src={qrCode} alt="Authenticator enrollment QR code" className="mx-auto h-52 w-52" />
              <p className="break-all rounded bg-slate-50 p-3">Manual setup key: <code>{manualSecret}</code></p>
            </div>
          )}
          <label className="block text-sm font-medium text-slate-700">
            Authenticator code
            <input required inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          {error && <p className="text-sm text-rose-800" role="alert">{error}</p>}
          <button disabled={busy} className="w-full rounded-lg bg-rose-700 px-4 py-3 font-semibold text-white disabled:opacity-50">
            {busy ? 'Verifying…' : 'Verify and continue'}
          </button>
          <button type="button" disabled={busy} onClick={() => void runAction(async () => {
            const { error: signOutError } = await getSupabaseClient().auth.signOut();
            if (signOutError) throw signOutError;
          })} className="w-full rounded-lg border px-4 py-2 text-slate-700 disabled:opacity-50">Sign out</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-rose-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-rose-700">JP Events</p>
            <h1 className="text-xl font-semibold text-slate-900">Content administration</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span>{adminEmail}</span>
            <button type="button" disabled={busy} onClick={() => void runAction(async () => {
              await enableEditMode();
              navigate('/');
            })} className="rounded-lg bg-rose-700 px-3 py-2 font-semibold text-white hover:bg-rose-800 disabled:opacity-50">
              Edit Website Images
            </button>
            <button type="button" disabled={busy} onClick={() => void runAction(async () => {
              const { error: signOutError } = await getSupabaseClient().auth.signOut();
              if (signOutError) throw signOutError;
              setView('dashboard');
            })} className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-50">Sign out</button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl flex-wrap gap-2 px-4 pb-4" aria-label="CMS sections">
          {navButton('dashboard', 'Dashboard')}
          {navButton('portfolio', 'Portfolio')}
          {navButton('venues', 'Venues')}
          {navButton('media', 'Media library')}
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        {error && <p className="mb-5 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">{error}</p>}
        {notice && <p className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">{notice}</p>}
        {view === 'dashboard' && (
          <div>
            <h2 className="mb-5 text-2xl font-semibold text-slate-900">Overview</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Portfolio entries', dashboard?.portfolio.length ?? 0],
                ['Venues', dashboard?.venues.length ?? 0],
                ['Media assets', dashboard?.media.length ?? 0],
                ['Published entries', [...(dashboard?.portfolio ?? []), ...(dashboard?.venues ?? [])].filter((item) => item.status === 'published').length],
              ].map(([label, count]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-sm text-slate-600">{label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{count}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-900">Recent administrator activity</h3>
              {dashboard?.activity.length ? (
                <ul className="mt-4 divide-y divide-slate-100">
                  {dashboard.activity.map((activity) => (
                    <li key={activity.id} className="py-3 text-sm text-slate-700">
                      {activity.action} · {activity.entity_type} · {new Date(activity.occurred_at).toLocaleString()}
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-3 text-sm text-slate-600">No activity recorded yet.</p>}
            </div>
          </div>
        )}

        {(view === 'portfolio' || view === 'venues') && (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
            <div>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">{view === 'portfolio' ? 'Portfolio entries' : 'Venues'}</h2>
                  <p className="mt-1 text-sm text-slate-600">Drafts are private. Publishing updates the public website.</p>
                </div>
                <button type="button" onClick={() => { resetEditor(); setError(null); }} className="rounded-lg bg-rose-700 px-4 py-2 font-medium text-white">
                  Add {view === 'portfolio' ? 'portfolio item' : 'venue'}
                </button>
              </div>
              <div className="space-y-3">
                {currentRecords.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No entries found.</p>}
                {[...currentRecords].sort((a, b) => a.sort_order - b.sort_order).map((record, index) => {
                  const type: CmsContentType = view === 'portfolio' ? 'portfolio' : 'venue';
                  const title = 'title' in record ? record.title : record.name;
                  const venueRecord = view === 'venues' ? record as VenueRecord : null;
                  const coverMediaId = venueRecord?.venue_media?.find((entry) => entry.role === 'cover')?.media_id;
                  const coverUrl = coverMediaId ? mediaUrls[coverMediaId] : undefined;
                  return (
                    <article key={record.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {view === 'venues' && (
                            coverUrl
                              ? <img src={coverUrl} alt={`${title} cover`} loading="lazy" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                              : <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-100 px-2 text-center text-[10px] text-slate-500">No cover yet</div>
                          )}
                          <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900">{title}</h3>
                          <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                            {record.status} · order {record.sort_order}
                            {'title' in record && record.social_wall_row
                              ? ` · social wall row ${record.social_wall_row}, position ${record.social_wall_sort_order + 1}`
                              : ''}
                          </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => type === 'portfolio' ? editPortfolio(record as PortfolioRecord) : editVenue(record as VenueRecord)} className="rounded border px-3 py-1.5 text-sm">Edit</button>
                          <button type="button" disabled={busy || index === 0} onClick={() => shiftRecord(type, index, -1)} className="rounded border px-3 py-1.5 text-sm disabled:opacity-40" aria-label={`Move ${title} up`}>↑</button>
                          <button type="button" disabled={busy || index === currentRecords.length - 1} onClick={() => shiftRecord(type, index, 1)} className="rounded border px-3 py-1.5 text-sm disabled:opacity-40" aria-label={`Move ${title} down`}>↓</button>
                          {record.status === 'published' ? (
                            <button type="button" disabled={busy} onClick={() => void updateStatus(type, record.id, 'draft')} className="rounded border border-amber-300 px-3 py-1.5 text-sm text-amber-800">Unpublish</button>
                          ) : (
                            <button type="button" disabled={busy} onClick={() => void publish(type, record.id)} className="rounded border border-emerald-300 px-3 py-1.5 text-sm text-emerald-800">Publish</button>
                          )}
                          {record.status !== 'archived' && <button type="button" disabled={busy} onClick={() => void updateStatus(type, record.id, 'archived')} className="rounded border px-3 py-1.5 text-sm">Archive</button>}
                          <button type="button" disabled={busy} onClick={() => removeContent(type, record.id)} className="rounded border border-rose-300 px-3 py-1.5 text-sm text-rose-800">Delete</button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              {view === 'portfolio' && (
                <section className="mt-8 rounded-xl border border-rose-100 bg-rose-50/60 p-4" aria-labelledby="social-wall-admin-title">
                  <h3 id="social-wall-admin-title" className="text-lg font-semibold text-slate-900">Follow the Magic social wall</h3>
                  <p className="mt-1 text-sm text-slate-600">Choose one of the three rows in a portfolio item, then use these arrows to set its position. Each row is independently swipeable on the website, and published images keep their assigned row and order on every screen size.</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {([1, 2, 3] as const).map((row) => {
                      const rowRecords = portfolio
                        .filter((record) => record.social_wall_row === row)
                        .sort((a, b) => a.social_wall_sort_order - b.social_wall_sort_order || a.sort_order - b.sort_order);
                      return (
                        <div key={row} className="rounded-lg border border-rose-100 bg-white p-3">
                          <h4 className="font-medium text-slate-800">Row {row}</h4>
                          {rowRecords.length === 0 ? (
                            <p className="mt-2 text-sm text-slate-500">No images assigned.</p>
                          ) : (
                            <ol className="mt-2 space-y-2">
                              {rowRecords.map((record, index) => (
                                <li key={record.id} className="flex items-center justify-between gap-2 rounded border border-slate-100 px-2 py-2">
                                  <span className="min-w-0 truncate text-sm text-slate-700" title={record.title}>{record.title}<span className="ml-1 text-xs text-slate-400">({record.status})</span></span>
                                  <span className="flex shrink-0 gap-1">
                                    <button type="button" disabled={busy || index === 0} onClick={() => shiftSocialWallRecord(row, index, -1)} className="rounded border px-2 py-1 text-xs disabled:opacity-40" aria-label={`Move ${record.title} earlier in social wall row ${row}`}>↑</button>
                                    <button type="button" disabled={busy || index === rowRecords.length - 1} onClick={() => shiftSocialWallRecord(row, index, 1)} className="rounded border px-2 py-1 text-xs disabled:opacity-40" aria-label={`Move ${record.title} later in social wall row ${row}`}>↓</button>
                                  </span>
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            <form onSubmit={(event) => void saveContent(event)} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{editingType ? 'Edit draft' : 'New draft'}</h3>
                {editingType && <button type="button" onClick={resetEditor} className="text-sm text-rose-700">Cancel</button>}
              </div>
              {editingPublished && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Saving as a draft unpublishes this entry until you explicitly publish it again.</p>}
              {view === 'portfolio' ? (
                <>
                  <label className="block text-sm font-medium">Title<input required value={portfolioForm.title} onChange={(event) => setPortfolioForm({ ...portfolioForm, title: event.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                  <label className="block text-sm font-medium">Slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={portfolioForm.slug} onChange={(event) => setPortfolioForm({ ...portfolioForm, slug: event.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                  <label className="block text-sm font-medium">Description<textarea required rows={4} value={portfolioForm.description} onChange={(event) => setPortfolioForm({ ...portfolioForm, description: event.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm font-medium">Category<input required value={portfolioForm.category} onChange={(event) => setPortfolioForm({ ...portfolioForm, category: event.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                    <label className="block text-sm font-medium">Guest capacity<input type="number" min="0" value={portfolioForm.guest_capacity ?? ''} onChange={(event) => setPortfolioForm({ ...portfolioForm, guest_capacity: event.target.value ? Number(event.target.value) : null })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                    <label className="block text-sm font-medium">Event date<input type="date" value={portfolioForm.event_date ?? ''} onChange={(event) => setPortfolioForm({ ...portfolioForm, event_date: event.target.value || null })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                    <label className="block text-sm font-medium">Location<input value={portfolioForm.location ?? ''} onChange={(event) => setPortfolioForm({ ...portfolioForm, location: event.target.value || null })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                    <label className="block text-sm font-medium">Duration<input value={portfolioForm.duration ?? ''} onChange={(event) => setPortfolioForm({ ...portfolioForm, duration: event.target.value || null })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                    <label className="block text-sm font-medium">Budget<input value={portfolioForm.budget ?? ''} onChange={(event) => setPortfolioForm({ ...portfolioForm, budget: event.target.value || null })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                    <label className="block text-sm font-medium">Tags (comma separated)<input value={portfolioForm.tags.join(', ')} onChange={(event) => setPortfolioForm({ ...portfolioForm, tags: splitList(event.target.value) })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                    <label className="block text-sm font-medium">Awards (comma separated)<input value={portfolioForm.awards.join(', ')} onChange={(event) => setPortfolioForm({ ...portfolioForm, awards: splitList(event.target.value) })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                    <label className="block text-sm font-medium">Photographer<input value={portfolioForm.photographer ?? ''} onChange={(event) => setPortfolioForm({ ...portfolioForm, photographer: event.target.value || null })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                  </div>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={portfolioForm.featured} onChange={(event) => setPortfolioForm({ ...portfolioForm, featured: event.target.checked })} />Featured</label>
                  <label className="block text-sm font-medium">Follow the Magic social wall
                    <select
                      value={portfolioForm.social_wall_row ?? ''}
                      onChange={(event) => {
                        const row = event.target.value ? Number(event.target.value) as 1 | 2 | 3 : null;
                        const nextOrder = row && row !== portfolioForm.social_wall_row
                          ? portfolio.filter((item) => item.social_wall_row === row).reduce((maxOrder, item) => Math.max(maxOrder, item.social_wall_sort_order), -1) + 1
                          : portfolioForm.social_wall_sort_order;
                        setPortfolioForm({
                          ...portfolioForm,
                          social_wall_row: row,
                          social_wall_sort_order: row ? nextOrder : 0,
                        });
                      }}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    >
                      <option value="">Do not show in social wall</option>
                      <option value="1">Row 1</option>
                      <option value="2">Row 2</option>
                      <option value="3">Row 3</option>
                    </select>
                    <span className="mt-1 block text-xs font-normal text-slate-500">New placements go to the end of the row. Reorder images with the row controls on the left.</span>
                  </label>
                  <label className="block text-sm font-medium">Sort order<input type="number" value={portfolioForm.sort_order} onChange={(event) => setPortfolioForm({ ...portfolioForm, sort_order: Number(event.target.value) })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                  {portfolioForm.mediaIds.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto">{portfolioForm.mediaIds.map((id) => {
                      const asset = media.find((item) => item.id === id);
                      const url = mediaUrls[id];
                      return <div key={id} className="relative shrink-0">{url && <img src={url} alt={asset?.alt_text ?? ''} className="h-20 w-20 rounded object-cover" />}<button type="button" onClick={() => setPortfolioForm({ ...portfolioForm, mediaIds: portfolioForm.mediaIds.filter((mediaId) => mediaId !== id) })} className="absolute -right-1 -top-1 rounded-full bg-white px-1 text-rose-700" aria-label="Remove image from item">×</button></div>;
                    })}</div>
                  )}
                  <select
                    value=""
                    aria-label="Attach an existing portfolio image"
                    onChange={(event) => {
                      const id = event.target.value;
                      if (id && !portfolioForm.mediaIds.includes(id)) setPortfolioForm({ ...portfolioForm, mediaIds: [...portfolioForm.mediaIds, id] });
                    }}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="">Attach existing media…</option>
                    {media.filter((asset) => ['staging', 'published'].includes(asset.state) && mediaUrls[asset.id] && !portfolioForm.mediaIds.includes(asset.id)).map((asset) => <option key={asset.id} value={asset.id}>{asset.original_filename}</option>)}
                  </select>
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => { setSelectedFiles(Array.from(event.currentTarget.files ?? [])); event.currentTarget.value = ''; }} className="block w-full text-sm" aria-label="Add portfolio images" />
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium">Venue name<input required value={venueForm.name} onChange={(event) => setVenueForm({ ...venueForm, name: event.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                  <label className="block text-sm font-medium">Slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={venueForm.slug} onChange={(event) => setVenueForm({ ...venueForm, slug: event.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                  <label className="block text-sm font-medium">Homepage section
                    <select required value={venueForm.category_id} onChange={(event) => setVenueForm({ ...venueForm, category_id: event.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2">
                      <option value="">Select a section…</option>
                      {venueCategories.map((category) => <option key={category.id} value={category.id} disabled={!category.is_active}>{category.name}{category.is_active ? '' : ' (inactive)'}</option>)}
                    </select>
                  </label>
                  <label className="block text-sm font-medium">Subtitle<input value={venueForm.subtitle ?? ''} onChange={(event) => setVenueForm({ ...venueForm, subtitle: event.target.value || null })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                  <label className="block text-sm font-medium">Description<textarea required rows={4} value={venueForm.description} onChange={(event) => setVenueForm({ ...venueForm, description: event.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                  <label className="block text-sm font-medium">Guest capacity<input required type="number" min="1" value={venueForm.guest_capacity} onChange={(event) => setVenueForm({ ...venueForm, guest_capacity: Number(event.target.value) })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                  <label className="block text-sm font-medium">Location<input value={venueForm.location ?? ''} onChange={(event) => setVenueForm({ ...venueForm, location: event.target.value || null })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm font-medium">Public price type
                      <select value={venueForm.price_type} onChange={(event) => setVenueForm({ ...venueForm, price_type: event.target.value as VenueDraftInput['price_type'], price_amount: event.target.value === 'contact_for_quote' ? null : venueForm.price_amount })} className="mt-1 w-full rounded-lg border px-3 py-2">
                        <option value="contact_for_quote">Contact for quote</option>
                        <option value="fixed">Fixed price</option>
                        <option value="starting_from">Starting from</option>
                        <option value="per_event">Per event</option>
                        <option value="per_plate">Per plate</option>
                      </select>
                    </label>
                    {venueForm.price_type !== 'contact_for_quote' && (
                      <label className="block text-sm font-medium">Public price (INR)
                        <input required type="number" min="0" step="1" value={venueForm.price_amount ?? ''} onChange={(event) => setVenueForm({ ...venueForm, price_amount: event.target.value ? Number(event.target.value) : null })} className="mt-1 w-full rounded-lg border px-3 py-2" />
                      </label>
                    )}
                  </div>
                  <label className="block text-sm font-medium">Price note<input value={venueForm.price_note ?? ''} onChange={(event) => setVenueForm({ ...venueForm, price_note: event.target.value || null })} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="Optional terms or inclusions" /></label>
                  <label className="block text-sm font-medium">Amenities (comma separated)<input value={venueForm.amenities.join(', ')} onChange={(event) => setVenueForm({ ...venueForm, amenities: splitList(event.target.value) })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={venueForm.featured} onChange={(event) => setVenueForm({ ...venueForm, featured: event.target.checked })} />Featured</label>
                  <label className="block text-sm font-medium">Sort order<input type="number" value={venueForm.sort_order} onChange={(event) => setVenueForm({ ...venueForm, sort_order: Number(event.target.value) })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
                  {venueForm.mediaIds.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs text-slate-600">First image is the cover; use arrows to reorder the gallery.</p>
                      <div className="flex gap-2 overflow-x-auto">{venueForm.mediaIds.map((id, index) => {
                      const asset = media.find((item) => item.id === id);
                      const url = mediaUrls[id];
                      return <div key={id} className="relative shrink-0">{url && <img src={url} alt={asset?.alt_text ?? ''} className="h-20 w-20 rounded object-cover" />}{index === 0 && <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[10px] text-white">Cover</span>}<div className="mt-1 flex justify-between"><button type="button" disabled={index === 0} onClick={() => setVenueForm({ ...venueForm, mediaIds: venueForm.mediaIds.map((mediaId, order) => order === index ? venueForm.mediaIds[index - 1] : order === index - 1 ? id : mediaId) })} className="rounded px-2 text-sm text-rose-700 disabled:opacity-30" aria-label="Move image earlier">←</button><button type="button" disabled={index === venueForm.mediaIds.length - 1} onClick={() => setVenueForm({ ...venueForm, mediaIds: venueForm.mediaIds.map((mediaId, order) => order === index ? venueForm.mediaIds[index + 1] : order === index + 1 ? id : mediaId) })} className="rounded px-2 text-sm text-rose-700 disabled:opacity-30" aria-label="Move image later">→</button><button type="button" onClick={() => setVenueForm({ ...venueForm, mediaIds: venueForm.mediaIds.filter((mediaId) => mediaId !== id) })} className="rounded px-2 text-sm text-rose-700" aria-label="Remove image from venue">×</button></div></div>;
                    })}</div>
                    </div>
                  )}
                  <select
                    value=""
                    aria-label="Attach an existing venue image"
                    onChange={(event) => {
                      const id = event.target.value;
                      if (id && !venueForm.mediaIds.includes(id)) setVenueForm({ ...venueForm, mediaIds: [...venueForm.mediaIds, id] });
                    }}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="">Attach existing media…</option>
                    {media.filter((asset) => ['staging', 'published'].includes(asset.state) && mediaUrls[asset.id] && !venueForm.mediaIds.includes(asset.id)).map((asset) => <option key={asset.id} value={asset.id}>{asset.original_filename}</option>)}
                  </select>
                  <div className="space-y-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                    <label className="block text-sm font-medium text-slate-800">Reception hall photos
                      <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => { setSelectedFiles(Array.from(event.currentTarget.files ?? [])); event.currentTarget.value = ''; }} className="mt-2 block w-full text-sm" aria-label="Add reception hall photos" />
                    </label>
                    <p className="text-xs leading-relaxed text-slate-600">Draft images are stored privately in Supabase Storage. Publishing promotes them to the public website image bucket.</p>
                  </div>
                </>
              )}
              {selectedFiles.length > 0 && (
                <section aria-label="Selected image previews" className="space-y-2">
                  <p className="text-sm font-medium text-slate-800">Preview {view === 'venues' ? 'reception hall' : 'portfolio'} uploads</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {selectedFilePreviewUrls.map((url, index) => {
                      const file = selectedFiles[index];
                      if (!file) return null;
                      return (
                        <figure key={`${file.name}-${file.lastModified}-${index}`} className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                          <div className="relative aspect-[4/3] bg-slate-100">
                            <img src={url} alt={`Preview of ${file.name}`} className="h-full w-full object-cover" />
                            <button type="button" onClick={() => setSelectedFiles((files) => files.filter((_, fileIndex) => fileIndex !== index))} className="absolute right-2 top-2 rounded-full bg-white/95 px-2 py-1 text-xs font-medium text-slate-800 shadow" aria-label={`Remove ${file.name}`}>Remove</button>
                          </div>
                          <figcaption className="truncate px-2 py-1.5 text-xs text-slate-600" title={file.name}>{file.name}</figcaption>
                        </figure>
                      );
                    })}
                  </div>
                </section>
              )}
              {uploadProgress !== null && <p className="text-sm text-slate-600" role="status">Uploading images: {uploadProgress}%</p>}
              <button type="submit" disabled={busy} className="w-full rounded-lg bg-rose-700 px-4 py-3 font-semibold text-white disabled:opacity-50">
                {busy ? 'Saving…' : 'Save as draft'}
              </button>
            </form>
          </div>
        )}

        {view === 'media' && (
          <div>
            <h2 className="mb-2 text-2xl font-semibold text-slate-900">Media library</h2>
            <p className="mb-5 text-sm text-slate-600">Image uploads are checked before publication; only published images are publicly readable.</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {media.map((asset) => {
                const url = mediaUrls[asset.id];
                return (
                  <article key={asset.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {url && <img src={url} alt={asset.alt_text} loading="lazy" className="aspect-square w-full object-cover" />}
                    <div className="space-y-2 p-3">
                      <p className="truncate text-sm font-medium text-slate-800">{asset.original_filename}</p>
                      <p className="text-xs text-slate-500">{asset.mime_type} · {Math.ceil(asset.byte_size / 1024)} KB · {asset.state}</p>
                      <label className="block text-xs text-slate-600">Alt text
                        <input
                          key={`${asset.id}:${asset.alt_text}`}
                          defaultValue={asset.alt_text}
                          onBlur={(event) => {
                            if (event.currentTarget.value !== asset.alt_text) {
                              void runAction(async () => {
                                await updateMediaAltText(asset.id, event.currentTarget.value);
                                await loadData();
                              }, 'Alternative text updated.');
                            }
                          }}
                          className="mt-1 w-full rounded border px-2 py-1 text-sm"
                        />
                      </label>
                      <button type="button" disabled={busy || asset.state === 'deleted'} onClick={() => removeMedia(asset)} className="w-full rounded border border-rose-300 px-3 py-1.5 text-sm text-rose-800 disabled:opacity-50">
                        Request safe deletion
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
            {media.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No media assets found.</p>}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminCms;
