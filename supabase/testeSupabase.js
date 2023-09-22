const { createClient } = require('@supabase/supabase-js');


const supabase = createClient("https://tgnvsnaruyitkjdjzlhw.supabase.co/","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnbnZzbmFydXlpdGtqZGp6bGh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQxOTAyMjcsImV4cCI6MjAwOTc2NjIyN30.4ZC0exxepRwQJHvVVGr8q6EIHFKKEV83IIzy5hyOgiQ")


async function consultarDados(){
  try {
    const { data, error } = await supabase.from('gym-sede-academia').select('*');
    
    if(error){
      throw error
    }
    return data
  } catch (error) {
    console.error('Erro inesperado:', error.message);
  }
}

consultarDados()

module.exports = consultarDados