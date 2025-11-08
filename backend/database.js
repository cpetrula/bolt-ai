import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

class DatabaseService {
  constructor() {
    this.client = createClient(config.supabase.url, config.supabase.key);
  }

  async logCall(callData) {
    try {
      const data = {
        call_sid: callData.call_sid,
        direction: callData.direction,
        from_number: callData.from_number,
        to_number: callData.to_number,
        status: callData.status || 'initiated',
        started_at: callData.started_at || new Date().toISOString(),
        duration: callData.duration || 0,
        transcript: callData.transcript || '',
        metadata: callData.metadata || {},
      };

      const { data: result, error } = await this.client
        .from('calls')
        .insert([data])
        .select();

      if (error) throw error;

      console.log(`Call logged: ${callData.call_sid}`);
      return result[0];
    } catch (error) {
      console.error('Error logging call:', error.message);
      return null;
    }
  }

  async updateCall(callSid, updates) {
    try {
      const { data, error } = await this.client
        .from('calls')
        .update(updates)
        .eq('call_sid', callSid)
        .select();

      if (error) throw error;

      console.log(`Call updated: ${callSid}`);
      return data[0];
    } catch (error) {
      console.error('Error updating call:', error.message);
      return null;
    }
  }

  async createLead(leadData) {
    try {
      const data = {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        business_type: leadData.business_type,
        call_sid: leadData.call_sid,
        status: leadData.status || 'new',
        notes: leadData.notes || '',
        created_at: new Date().toISOString(),
        metadata: leadData.metadata || {},
      };

      const { data: result, error } = await this.client
        .from('leads')
        .insert([data])
        .select();

      if (error) throw error;

      console.log(`Lead created: ${leadData.email}`);
      return result[0];
    } catch (error) {
      console.error('Error creating lead:', error.message);
      return null;
    }
  }

  async getCalls(limit = 50, offset = 0) {
    try {
      const { data, error } = await this.client
        .from('calls')
        .select('*')
        .order('started_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error retrieving calls:', error.message);
      return [];
    }
  }

  async getLeads(limit = 50, offset = 0) {
    try {
      const { data, error } = await this.client
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error retrieving leads:', error.message);
      return [];
    }
  }
}

export const dbService = new DatabaseService();
