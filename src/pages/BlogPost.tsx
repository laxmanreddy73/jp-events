import { Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react';

const BlogPost = () => {
  const blogPost = {
    title: '10 Essential Tips for Planning Your Dream Wedding',
    excerpt: 'Planning your wedding can be overwhelming, but with the right guidance, it can be an enjoyable journey. Here are our top tips to help you create the perfect celebration.',
    content: `
      <p>Planning your wedding is one of the most exciting times in your life, but it can also be overwhelming. With so many details to consider and decisions to make, it's easy to feel stressed. That's why we've compiled our top 10 essential tips to help you plan your dream wedding with confidence and ease.</p>

      <h2>1. Set Your Budget Early</h2>
      <p>Before you start booking vendors or choosing venues, sit down with your partner and determine your wedding budget. Be realistic about what you can afford and prioritize the elements that matter most to you. Remember to include a contingency fund for unexpected expenses.</p>

      <h2>2. Create a Timeline</h2>
      <p>Start planning at least 12-18 months before your wedding date. This gives you ample time to book your preferred vendors, find the perfect venue, and handle all the details without rushing. Create a month-by-month checklist to stay organized.</p>

      <h2>3. Choose the Right Venue</h2>
      <p>Your venue sets the tone for your entire wedding. Consider the season, guest count, location, and style when selecting your venue. Visit multiple options and ask lots of questions about what's included in the package.</p>

      <h2>4. Hire Professional Vendors</h2>
      <p>Working with experienced professionals can make all the difference. From photographers to caterers to decorators like us at JP Events, choose vendors who understand your vision and have a proven track record of excellence.</p>

      <h2>5. Don't Forget the Guest Experience</h2>
      <p>Think about your guests' comfort and enjoyment. Provide clear directions, arrange transportation if needed, plan appropriate meal options, and ensure there's entertainment throughout the event.</p>

      <h2>6. Personalize Your Celebration</h2>
      <p>Make your wedding uniquely yours by incorporating personal touches. This could be through custom decorations, meaningful rituals, favorite songs, or special family traditions.</p>

      <h2>7. Stay Flexible</h2>
      <p>Things don't always go exactly as planned, and that's okay. Stay flexible and keep perspective. What matters most is celebrating your love with the people who matter most to you.</p>

      <h2>8. Take Care of Yourself</h2>
      <p>Wedding planning can be stressful. Make sure to take time for self-care, maintain a healthy lifestyle, and don't let wedding planning consume all your time and energy.</p>

      <h2>9. Delegate Tasks</h2>
      <p>You don't have to do everything yourself. Delegate tasks to trusted family members, friends, or hire a wedding planner to handle the details so you can enjoy your engagement period.</p>

      <h2>10. Remember What It's All About</h2>
      <p>At the end of the day, your wedding is about celebrating your love and commitment to each other. Don't lose sight of that in the midst of all the planning details.</p>

      <h2>Final Thoughts</h2>
      <p>Planning your dream wedding should be an enjoyable experience. With these tips and the right team of professionals by your side, you can create a beautiful celebration that you and your guests will remember forever. At JP Events, we're here to help bring your vision to life with stunning decor and flawless execution.</p>
    `,
    image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200',
    author: 'JP Events Team',
    date: 'March 15, 2024',
    readTime: '5 min read',
    category: 'Planning Tips'
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          to="/blog"
          className="inline-flex items-center text-rosegold-600 hover:text-rosegold-700 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>

        <div className="mb-8">
          <span className="inline-block bg-rosegold-100 text-rosegold-700 px-4 py-1 rounded-full text-sm font-medium mb-4">
            {blogPost.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-6">
            {blogPost.title}
          </h1>
          <div className="flex items-center space-x-6 text-gray-600">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              {blogPost.author}
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              {blogPost.date}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {blogPost.readTime}
            </div>
          </div>
        </div>

        <img
          src={blogPost.image}
          alt={blogPost.title}
          className="w-full h-96 object-cover rounded-2xl mb-12 shadow-xl"
        />

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blogPost.content }}
          style={{
            lineHeight: '1.8',
          }}
        />

        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="bg-gradient-to-r from-champagne-50 to-blush-50 rounded-2xl p-8">
            <h3 className="text-2xl font-serif font-bold text-gray-800 mb-4">
              Ready to Plan Your Dream Wedding?
            </h3>
            <p className="text-gray-600 mb-6">
              Let JP Events help you create the wedding of your dreams with our expert planning and stunning decor services.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-rosegold-500 hover:bg-rosegold-600 text-white px-8 py-3 rounded-full font-semibold transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </article>

      <style>{`
        .prose h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #A63F63;
          font-family: 'Playfair Display', serif;
        }
        .prose p {
          margin-bottom: 1.5rem;
          color: #4b5563;
        }
      `}</style>
    </div>
  );
};

export default BlogPost;
