import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";

function App() {

  const [user, setUser] = useState(null);

  useEffect(() => {

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();

  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
    />
  );
}

export default App;