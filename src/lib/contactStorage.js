import supabase from './supabase';
import { sendEmail } from './emailService';

// Each submit function writes to Supabase first - that's now the durable
// record an admin can see in /admin - then fires the email notification
// best-effort. An email failure is logged but doesn't fail the submission,
// since the record is already saved; a DB failure does fail it, since
// without that write there'd be nothing left to find later.

export const submitContactForm = async (formData) => {
  try {
    const { data, error } = await supabase
      .from('contact_messages_portal123')
      .insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject || null,
        message: formData.message
      }])
      .select()
      .single();

    if (error) throw error;

    sendEmail(formData, 'contact').catch(err =>
      console.error('Contact notification email failed:', err)
    );

    return { data, error: null };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { data: null, error: error.message };
  }
};

export const submitRealmSignup = async (formData) => {
  try {
    const { data, error } = await supabase
      .from('realm_signups_portal123')
      .insert([{
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || null,
        address_line1: formData.address_line1 || null,
        address_line2: formData.address_line2 || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        country: formData.country || null,
        birthday: formData.birthday || null,
        marital_status: formData.marital_status || null,
        anniversary: formData.anniversary || null
      }])
      .select()
      .single();

    if (error) throw error;

    sendEmail(formData, 'realm').catch(err =>
      console.error('Realm signup notification email failed:', err)
    );

    return { data, error: null };
  } catch (error) {
    console.error('Error submitting realm signup:', error);
    return { data: null, error: error.message };
  }
};

export const submitTableGroupSignup = async (formData) => {
  try {
    const { data, error } = await supabase
      .from('table_group_signups_portal123')
      .insert([{
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        party_size: formData.party_size || null,
        unavailable_days: formData.unavailable_days || []
      }])
      .select()
      .single();

    if (error) throw error;

    sendEmail(formData, 'table_group').catch(err =>
      console.error('Table group signup notification email failed:', err)
    );

    return { data, error: null };
  } catch (error) {
    console.error('Error submitting table group signup:', error);
    return { data: null, error: error.message };
  }
};
