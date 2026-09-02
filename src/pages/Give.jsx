import React from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import StandardButton from '../components/StandardButton';

const {FiCreditCard,FiExternalLink,FiShield,FiHome}=FiIcons;

const Give=()=> {
  const handleGiveClick=()=> {
    window.open('https://onrealm.org/urfellowship/-/form/give/now','_blank');
  };

  return (
    <div className="min-h-screen bg-accent py-12 relative">
      {/* Back to Home Button - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105" style={{backgroundColor: '#83A682'}} title="Back to Home">
          <SafeIcon icon={FiHome} className="h-5 w-5 text-white" />
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8}}
            className="flex items-center justify-center space-x-4 mb-1"
          >
            <SafeIcon icon={FiCreditCard} className="h-8 w-8 text-primary" />
            <Link to="/" className="hover:text-primary transition-colors">
              <h1 className="text-3xl md:text-4xl">
                Give
              </h1>
            </Link>
          </motion.div>
          <motion.p
            initial={{opacity: 0,y: 30}}
            animate={{opacity: 1,y: 0}}
            transition={{duration: 0.8,delay: 0.2}}
            className="text-base page-subtitle"
          >
            Support our church through online giving
          </motion.p>
        </div>

        {/* Give Card */}
        <motion.div
          initial={{opacity: 0,y: 30}}
          animate={{opacity: 1,y: 0}}
          transition={{duration: 0.8,delay: 0.4}}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl mb-4">
                Secure Online Giving
              </h3>
              <p className="text-text-primary mb-6">
                Your generous giving helps support our church's mission and
                ministries. Click below to access our secure online giving
                platform.
              </p>
              <StandardButton
                onClick={handleGiveClick}
                icon={FiExternalLink}
                className="text-lg px-8 py-4"
              >
                Give Online Now
              </StandardButton>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <SafeIcon icon={FiShield} className="h-6 w-6 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">
                    Safe & Secure
                  </h4>
                  <p className="text-green-700">
                    Your donation is processed through our secure,encrypted
                    payment system. Your financial information is protected
                    with industry-standard security measures.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-accent p-6 rounded-lg">
                <h4 className="font-semibold text-text-primary mb-2">
                  Tax Deductible
                </h4>
                <p className="text-text-primary text-sm">
                  All donations are tax-deductible. You will receive a receipt
                  for your records.
                </p>
              </div>
              <div className="bg-accent p-6 rounded-lg">
                <h4 className="font-semibold text-text-primary mb-2">
                  Multiple Options
                </h4>
                <p className="text-text-primary text-sm">
                  Set up one-time gifts or recurring donations to support our
                  ongoing ministry.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{opacity: 0,y: 30}}
          animate={{opacity: 1,y: 0}}
          transition={{duration: 0.8,delay: 0.6}}
          className="mt-8 text-center"
        >
          <p className="text-text-primary">
            Questions about giving? Contact our church office for assistance.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Give;