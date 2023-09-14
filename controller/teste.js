const { createClient } = require('@supabase/supabase-js');


const supabase = createClient("https://ujliyaamllmntdwgqrqr.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqbGl5YWFtbGxtbnRkd2dxcnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM5NjAwODAsImV4cCI6MjAwOTUzNjA4MH0.tIfrE4ISvSifaa__3TVnMIU7gmIJPVEYjiukF5W1RXE")


async function consultarDados(){
  try {
    const { data } = await supabase.from('Usuario').select('email');
    const email = data.map(item => item.email)
    console.log(`Dados da tabela:`, email);
  } catch (error) {
    console.error('Erro inesperado:', error.message);
  }
}


consultarDados()