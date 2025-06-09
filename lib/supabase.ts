import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions
export const supabaseHelpers = {
  // User functions
  async createUser(userData: any) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    return { data, error }
  },

  // Custom GPT functions
  async createCustomGPT(gptData: any) {
    const { data, error } = await supabase
      .from('custom_gpts')
      .insert(gptData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getCustomGPTs(userId: string) {
    const { data, error } = await supabase
      .from('custom_gpts')
      .select('*')
      .or(`created_by.eq.${userId},is_public.eq.true`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getGPTByPasscode(passcode: string) {
    const { data, error } = await supabase
      .from('custom_gpts')
      .select('*')
      .eq('passcode', passcode)
      .single()
    
    return { data, error }
  },

  // Study Group functions
  async createStudyGroup(groupData: any) {
    const { data, error } = await supabase
      .from('study_groups')
      .insert(groupData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async joinStudyGroup(groupId: string, userId: string, isAdmin = false) {
    const { data, error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        is_admin: isAdmin
      })
    
    if (error) throw error
    return data
  },

  async getMyGroups(userId: string) {
    const { data, error } = await supabase
      .from('study_groups')
      .select(`
        *,
        group_members!inner(user_id)
      `)
      .eq('group_members.user_id', userId)
    
    if (error) throw error
    return data
  },

  // Chat functions
  async saveMessage(messageData: any) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getChatHistory(userId: string, gptId?: string, limit = 50) {
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (gptId) {
      query = query.eq('custom_gpt_id', gptId)
    }
    
    const { data, error } = await supabase
    
    if (error) throw error
    return data?.reverse() || []
  }
}
