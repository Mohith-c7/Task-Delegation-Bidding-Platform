import React from 'react';
import './BlogSection.css';

const imgImgLibImageCoverBusiness = "https://www.figma.com/api/mcp/asset/e106dc9b-cf34-4501-a681-fe6b0c91220a";
const imgImgLibImageCoverBusiness1 = "https://www.figma.com/api/mcp/asset/5853862a-ac29-40f3-8e7e-494df01ca8fa";
const imgImgLibImageCoverBusiness2 = "https://www.figma.com/api/mcp/asset/f7a85dc1-ac66-40af-8c3d-56ec6e3a0035";
const imgImgLibImageCoverBusiness3 = "https://www.figma.com/api/mcp/asset/51398e42-0b2f-430e-b2fc-aa273b115ae3";

function BlogSection() {
  const blogs = [
    {
      image: imgImgLibImageCoverBusiness,
      category: "Report",
      title: "The Rise of AI in Business Analytics: What You Need to Know"
    },
    {
      image: imgImgLibImageCoverBusiness1,
      category: "News",
      title: "Customizing Your DataWise Dashboard: A Step-by-Step Guide"
    },
    {
      image: imgImgLibImageCoverBusiness2,
      category: "News",
      title: "Customizing Your DataWise Dashboard: A Step-by-Step Guide"
    },
    {
      image: imgImgLibImageCoverBusiness3,
      category: "Report",
      title: "Customizing Your DataWise Dashboard: A Step-by-Step Guide"
    }
  ];

  return (
    <section className="blog-section">
      <div className="blog-container">
        <div className="blog-heading">
          <div className="eyebrow-tag">BLOGS</div>
          <h2 className="section-title centered">In the spotlight</h2>
          <p className="blog-subtitle">Stay updated with the latest trends, tips, and insights in business analytics. Explore our curated articles designed to empower your data-driven journey.</p>
        </div>
        <div className="blog-grid">
          {blogs.map((blog, index) => (
            <div key={index} className="blog-card">
              <div className="blog-image">
                <img src={blog.image} alt="" />
              </div>
              <div className="blog-content">
                <p className="blog-category">{blog.category}</p>
                <h3 className="blog-title">{blog.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BlogSection;
