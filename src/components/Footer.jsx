import React from 'react';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMapPin, FiPhone, FiMail, FiFacebook, FiInstagram, FiYoutube, FiSettings } = FiIcons;

const Footer = () => {
  return (
    <footer className="bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Church Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="/logo.png"
                alt="Upper Room Fellowship"
                className="h-8 w-auto brightness-0 invert"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm font-gsans">UR</span>
                </div>
                <span className="text-xl font-bold font-gsans uppercase">Upper Room Fellowship</span>
              </div>
            </div>
            <p className="font-caladea italic text-text-light mb-4">
              A place where faith grows, community thrives, and lives are transformed through God's love.
            </p>
            <div className="space-y-2 font-ui">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiMapPin} className="h-4 w-4 text-primary" />
                <span className="text-text-light">123 Faith Street, Hope City, HC 12345</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiPhone} className="h-4 w-4 text-primary" />
                <span className="text-text-light">(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiMail} className="h-4 w-4 text-primary" />
                <span className="text-text-light">info@upperroomfellowship.org</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold font-gsans uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2 font-caladea italic">
              <li><Link to="/about" className="text-text-light hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/services" className="text-text-light hover:text-primary transition-colors">Services</Link></li>
              <li><Link to="/events" className="text-text-light hover:text-primary transition-colors">Events</Link></li>
              <li><Link to="/ministries" className="text-text-light hover:text-primary transition-colors">Opportunities</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-lg font-bold font-gsans uppercase mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-text-light hover:text-primary transition-colors">
                <SafeIcon icon={FiFacebook} className="h-6 w-6" />
              </a>
              <a href="#" className="text-text-light hover:text-primary transition-colors">
                <SafeIcon icon={FiInstagram} className="h-6 w-6" />
              </a>
              <a href="#" className="text-text-light hover:text-primary transition-colors">
                <SafeIcon icon={FiYoutube} className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-400 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-center">
          <p className="font-ui text-text-light">
            © 2024 Upper Room Fellowship. All rights reserved.
          </p>
          <Link to="/admin" className="inline-flex items-center space-x-1.5 font-caladea italic text-text-light/60 hover:text-text-light transition-colors text-xs">
            <SafeIcon icon={FiSettings} className="h-3 w-3" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
