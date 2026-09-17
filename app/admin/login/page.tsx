import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  if (await getAuthenticatedAdmin()) redirect("/admin/dashboard");

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <p className="eyebrow">Raveena & Roshana</p>
        <h1>Wedding Management</h1>
        <p>
          Sign in with your authorised Supabase admin account. Super Admin has full system access; client Admin accounts only receive access to assigned weddings.
        </p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
