import React,{useState} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import {submitHappeningRsvp} from '../lib/contactStorage';
import {useToast} from '../hooks/useToast';

const {FiX,FiUser,FiMail,FiPhone,FiHash,FiCheckCircle,FiArrowRight}=FiIcons;

// Modal RSVP form for a single published happening, surfaced from the
// public Calendar's day panel. Mirrors TableGroupSignup's submit/success
// pattern, scoped down to a lightweight overlay since it opens mid-page
// rather than owning its own route.
const HappeningRsvpForm=({happening,onClose})=> {
  const toast=useToast();
  const [formData,setFormData]=useState({name: '',email: '',phone: '',partySize: '1',notes: ''});
  const [isSubmitting,setIsSubmitting]=useState(false);
  const [isSubmitted,setIsSubmitted]=useState(false);

  const handleChange=(e)=> {
    const {name,value}=e.target;
    setFormData(prev=> ({...prev,[name]: value}));
  };

  const handleSubmit=async (e)=> {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const {error}=await submitHappeningRsvp({
        happening_id: happening.id,
        happening_title: happening.title,
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        party_size: formData.partySize ? parseInt(formData.partySize) : 1,
        notes: formData.notes || null
      });
      if (error) throw error;
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting RSVP:',error);
      toast.error('There was an error submitting your RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        exit={{opacity: 0}}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success"
            initial={{opacity: 0,scale: 0.92,y: 20}}
            animate={{opacity: 1,scale: 1,y: 0}}
            exit={{opacity: 0,scale: 0.92}}
            transition={{duration: 0.35}}
            className="relative bg-white rounded-3xl shadow-modern-lg p-8 max-w-sm w-full text-center"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{backgroundColor: '#83A682'}}>
              <SafeIcon icon={FiCheckCircle} className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">You're on the list!</h3>
            <p className="text-text-primary mb-6 leading-relaxed">
              Your RSVP for <span className="font-semibold">{happening.title}</span> has been received.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{opacity: 0,scale: 0.96,y: 10}}
            animate={{opacity: 1,scale: 1,y: 0}}
            exit={{opacity: 0,scale: 0.96}}
            transition={{duration: 0.25}}
            className="relative bg-white rounded-3xl shadow-modern-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full text-text-light hover:bg-accent transition-colors"
            >
              <SafeIcon icon={FiX} className="h-4 w-4" />
            </button>

            <h3 className="text-2xl font-bold text-text-primary mb-1 pr-8">RSVP</h3>
            <p className="text-text-light mb-6">{happening.title}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Name *</label>
                <div className="relative">
                  <SafeIcon icon={FiUser} className="absolute left-3 top-3.5 h-4 w-4 text-text-light" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input pl-9"
                    placeholder="Your name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Email</label>
                  <div className="relative">
                    <SafeIcon icon={FiMail} className="absolute left-3 top-3.5 h-4 w-4 text-text-light" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input pl-9"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <div className="relative">
                    <SafeIcon icon={FiPhone} className="absolute left-3 top-3.5 h-4 w-4 text-text-light" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input pl-9"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="form-label">Party Size</label>
                <div className="relative">
                  <SafeIcon icon={FiHash} className="absolute left-3 top-3.5 h-4 w-4 text-text-light" />
                  <input
                    type="number"
                    name="partySize"
                    value={formData.partySize}
                    onChange={handleChange}
                    min="1"
                    max="20"
                    className="form-input pl-9"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="2"
                  className="form-input"
                  placeholder="Anything we should know? (optional)"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Submitting...' : 'Submit RSVP'}</span>
                {!isSubmitting && <SafeIcon icon={FiArrowRight} className="h-4 w-4" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HappeningRsvpForm;
