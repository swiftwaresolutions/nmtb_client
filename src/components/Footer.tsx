import React from 'react';
import './footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-watermark">
      <div className="container me-0">
        <div className="row justify-content-end">
          <div className="col-auto">
            <h6>&copy; <span>{currentYear}</span> Swiftware Solutions. All rights reserved.</h6>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
