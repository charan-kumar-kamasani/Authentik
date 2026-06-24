import React from 'react';
import GenericPage from '../../components/GenericPage';
import { ArrowRight, BookOpen } from 'lucide-react';

const Blog = () => {
    const posts = [
        {
            category: "Industry News",
            title: "FDA DSCSA 2024 Deadlines: Is Your Supply Chain Ready?",
            date: "Oct 12, 2023",
            readTime: "5 min read",
            excerpt: "With the FDA stabilizing the Drug Supply Chain Security Act enforcement timeline, pharmaceutical manufacturers must utilize this window to implement interoperable serialization...",
            image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=800&q=80"
        },
        {
            category: "Technology",
            title: "Why Traditional Holograms Fail Against Modern Counterfeiters",
            date: "Sep 28, 2023",
            readTime: "8 min read",
            excerpt: "Holograms were once the gold standard for authentication. Today, illicit factories in Shenzhen can reverse-engineer physical holograms in under 48 hours. Here is why cryptographically secure tags are the only solution...",
            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
        },
        {
            category: "Customer Success",
            title: "How a Luxury Fashion Brand Recovered $4.2M in Lost Revenue",
            date: "Sep 15, 2023",
            readTime: "4 min read",
            excerpt: "By implementing invisible watermarks and NFT Certificates of Authenticity, this Parisian fashion house detected a massive gray market diversion ring in Southeast Asia...",
            image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80"
        }
    ];

    return (
        <GenericPage title="Insights & Intelligence" narrow={false}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
                    Expert perspectives on supply chain security, brand protection strategies, and regulatory compliance.
                </p>
            </div>

            {/* Featured Post */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'row', gap: '2rem', padding: '0', overflow: 'hidden', marginBottom: '4rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 400px', minHeight: '300px', backgroundImage: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div style={{ flex: '1 1 400px', padding: '3rem 3rem 3rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-color)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', width: 'fit-content' }}>
                        Featured Report
                    </div>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem', lineHeight: 1.3 }}>The 2024 State of Global Counterfeiting</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Our annual threat intelligence report analyzes over 50 million scan data points to reveal emerging counterfeit hubs, the rise of "super-fakes", and how AI is changing the brand protection landscape.
                    </p>
                    <button className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={18} /> Read the Report
                    </button>
                </div>
            </div>

            {/* Post Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {posts.map((post, i) => (
                    <div key={i} className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '200px', backgroundImage: `url(${post.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                        <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--accent-color)', fontWeight: 500 }}>{post.category}</span>
                                <span>{post.date} • {post.readTime}</span>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', lineHeight: 1.4 }}>{post.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', flex: 1 }}>{post.excerpt}</p>
                            <a href="#" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, marginTop: 'auto' }}>
                                Read Article <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <button className="btn btn-secondary">Load More Articles</button>
            </div>
        </GenericPage>
    );
};

export default Blog;
