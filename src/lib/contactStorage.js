import supabase from './supabase';
import { sendEmail } from './emailService';

// Each submit function writes to Supabase first - that's now the durable
// record an admin can see in /admin - then fires the email notification
// best-effort. An email failure is logged but doesn't fail the submission,
// since the record is already saved; a DB failure does fail it, since
// without that write there'd be nothing left to find later.

export const submitContactForm = async (formData) => {
  try {
    // No .select() here on purpose - these tables only grant SELECT to
    // authenticated (admin) sessions, and Postgres RLS filters RETURNING
    // rows through the SELECT policy same as a real SELECT. Anonymous
    // visitors have no SELECT access, so asking for the row back made the
    // insert intermittently "fail" (empty RETURNING -> PGRST116) whenever
    // the browser wasn't also carrying an admin session, even though the
    // row was saved. Skipping .select() sends Prefer: return=minimal, which
    // sidesteps that check entirely - nothing here uses the row back anyway.
    const { error } = await supabase
      .from('contact_messages_portal123')
      .insert([{
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject || null,
        message: formData.message
      }]);

    if (error) throw error;

    sendEmail(formData, 'contact').catch(err =>
      console.error('Contact notification email failed:', err)
    );

    return { data: null, error: null };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { data: null, error: error.message };
  }
};

export const submitRealmSignup = async (formData) => {
  try {
    // See submitContactForm - no .select() for the same RLS-on-RETURNING reason.
    const { error } = await supabase
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
      }]);

    if (error) throw error;

    sendEmail(formData, 'realm').catch(err =>
      console.error('Realm signup notification email failed:', err)
    );

    return { data: null, error: null };
  } catch (error) {
    console.error('Error submitting realm signup:', error);
    return { data: null, error: error.message };
  }
};

export const submitFacilityRentalRequest = async (formData) => {
  try {
    // See submitContactForm - no .select() for the same RLS-on-RETURNING reason.
    const { error } = await supabase
      .from('facility_rental_requests_portal123')
      .insert([{
        event_type: formData.event_type,
        organization_name: formData.organization_name || null,
        event_name: formData.event_name,
        purpose: formData.purpose,
        guest_count: formData.guest_count,
        event_date: formData.event_date,
        event_start_time: formData.event_start_time,
        event_end_time: formData.event_end_time,
        setup_schedule: formData.setup_schedule,
        setup_arrival_time: formData.setup_arrival_time,
        setup_departure_time: formData.setup_departure_time,
        is_member: formData.is_member,
        rooms_requested: formData.rooms_requested,
        additional_services: formData.additional_services,
        calculated_total: formData.calculated_total,
        responsible_first_name: formData.responsible_first_name,
        responsible_last_name: formData.responsible_last_name,
        responsible_email: formData.responsible_email,
        responsible_phone: formData.responsible_phone,
        return_address: formData.return_address,
        signature_name: formData.signature_name,
        signature_date: formData.signature_date,
        agreed_to_terms: formData.agreed_to_terms
      }]);

    if (error) throw error;

    // Formspree can't email an arbitrary recipient (the renter) or route to
    // a configurable address, so this one form uses its own edge function +
    // Resend instead of sendEmail/Formspree - see send-rental-email.
    supabase.functions.invoke('send-rental-email', { body: formData }).catch(err =>
      console.error('Facility rental notification email failed:', err)
    );

    return { data: null, error: null };
  } catch (error) {
    console.error('Error submitting facility rental request:', error);
    return { data: null, error: error.message };
  }
};

export const submitTableGroupSignup = async (formData) => {
  try {
    // See submitContactForm - no .select() for the same RLS-on-RETURNING reason.
    const { error } = await supabase
      .from('table_group_signups_portal123')
      .insert([{
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        party_size: formData.party_size || null,
        unavailable_days: formData.unavailable_days || []
      }]);

    if (error) throw error;

    sendEmail(formData, 'table_group').catch(err =>
      console.error('Table group signup notification email failed:', err)
    );

    return { data: null, error: null };
  } catch (error) {
    console.error('Error submitting table group signup:', error);
    return { data: null, error: error.message };
  }
};
