import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/admin-auth";

export default async function AdminPage() {
  redirect((await getAuthenticatedAdmin()) ? "/admin/dashboard" : "/admin/login");
}
