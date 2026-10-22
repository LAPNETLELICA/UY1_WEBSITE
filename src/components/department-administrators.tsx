"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Copy, FilePlus2, KeyRound, LoaderCircle, Trash2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Department = { id: string; name: string };
type Administrator = { user_id: string; display_name: string; email: string; is_active: boolean; created_at: string; last_login: string | null; department?: { name?: string; slug?: string } | null };
type PasswordRequest = { id: string; user_id: string; requested_at: string; administrator: Administrator | null };
const hasValidDepartmentAdminPassword = (value: string) => value.length >= 8 && value.length <= 256 && /[^A-Za-z0-9]/.test(value);

export function DepartmentAdministrators({ departments }: { departments: Department[] }) {
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<PasswordRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ displayName: "", username: "", email: "", departmentId: "", password: "", confirmPassword: "" });

  const request = useCallback(async (method: "GET" | "POST" | "DELETE" | "PATCH", body?: unknown) => {
    const client = createClient();
    if (!client) throw new Error("Supabase is not configured.");
    const { data } = await client.auth.getSession();
    if (!data.session) throw new Error("Your session has expired. Please sign in again.");
    let response: Response;
    try {
      response = await fetch("/api/admin/administrators", {
        method,
        headers: { Authorization: `Bearer ${data.session.access_token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new Error("Could not reach the administrator API. Check that the website server is running and try again.");
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Request failed.");
    return result;
  }, []);

  const load = useCallback(async () => {
    try { const result = await request("GET"); setAdministrators(result.administrators); setPasswordRequests(result.passwordRequests ?? []); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load administrators."); }
  }, [request]);

  useEffect(() => { void load(); }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    if (!hasValidDepartmentAdminPassword(form.password)) { setSaving(false); setMessage("Use at least 8 characters including at least one special character."); return; }
    if (form.password !== form.confirmPassword) { setSaving(false); setMessage("The passwords do not match."); return; }
    try {
      await request("POST", form);
      setForm({ displayName: "", username: "", email: "", departmentId: "", password: "", confirmPassword: "" }); setShowForm(false);
      setMessage("Department administrator account created and invitation email sent. Share the initial password with the administrator securely.");
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to send invitation."); await load(); }
    finally { setSaving(false); }
  }

  async function remove(userId: string, name: string) {
    if (!window.confirm(`Delete the account for ${name}? This cannot be undone.`)) return;
    try { await request("DELETE", { userId }); setMessage("Administrator account deleted."); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to delete the account."); }
  }

  async function resetPassword(userId: string, name: string, requestId?: string) {
    const password = window.prompt(`Create a new password for ${name} (at least 8 characters including a special character):`);
    if (password === null) return;
    const confirmation = window.prompt("Confirm the new password:");
    if (!hasValidDepartmentAdminPassword(password)) { setMessage("Use at least 8 characters including at least one special character."); return; }
    if (password !== confirmation) { setMessage("The passwords do not match."); return; }
    try { await request("PATCH", { userId, action: "set_password", password, requestId }); setMessage("New password saved. Share it with the administrator securely."); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to set the password."); }
  }

  async function copyPortal(slug?: string) {
    if (!slug) return;
    const portal = `${window.location.origin}/admin-uy1-${slug}`;
    try { await navigator.clipboard.writeText(portal); setMessage("Department portal link copied."); }
    catch { setMessage(`Department portal: ${portal}`); }
  }

  return <main className="admin-main admin-dashboard-overview"><div className="admin-topbar"><div><p className="section-kicker">Faculty super administrator</p><h1>Department administrators</h1><p>Create department accounts, assign secure passwords, send invitations, and handle password-reset requests.</p></div><button className="button button-primary" onClick={() => setShowForm(true)}><FilePlus2 size={15}/> Create administrator</button></div>
    {message && <p className="admin-notice">{message}</p>}
    {passwordRequests.length > 0 && <section className="admin-dashboard-shortcuts"><div className="section-head-row"><div><p className="section-kicker">Action required</p><h2 className="section-heading">Password-reset requests</h2></div></div><div className="admin-recent-list">{passwordRequests.map(reset => <article key={reset.id}><div><span className="section-kicker">Department administrator</span><h3>{reset.administrator?.display_name || "Administrator"}</h3><p>{reset.administrator?.email || "Account"} · requested {new Date(reset.requested_at).toLocaleString()}</p></div><button className="admin-action-button" onClick={() => resetPassword(reset.user_id, reset.administrator?.display_name || "this administrator", reset.id)}><KeyRound size={14}/> Create new password</button></article>)}</div></section>}
    <section className="admin-dashboard-shortcuts"><div className="section-head-row"><div><p className="section-kicker">Assigned accounts</p><h2 className="section-heading">Department access</h2></div></div>
      {administrators.length ? <div className="timetable-admin-table-scroll"><table className="timetable-admin-table"><thead><tr><th>Administrator</th><th>Email</th><th>Department</th><th>Portal link</th><th>Status</th><th>Created</th><th>Last login</th><th>Actions</th></tr></thead><tbody>{administrators.map(admin => <tr key={admin.user_id}><td>{admin.display_name}</td><td>{admin.email}</td><td>{admin.department?.name || "—"}</td><td>{admin.department?.slug ? <button className="admin-action-button" onClick={() => copyPortal(admin.department?.slug)}><Copy size={14}/> Copy portal</button> : "—"}</td><td><span className={`status-pill status-${admin.is_active ? "published" : "archived"}`}>{admin.is_active ? "Active" : "Disabled"}</span></td><td>{new Date(admin.created_at).toLocaleDateString()}</td><td>{admin.last_login ? new Date(admin.last_login).toLocaleString() : "Not yet"}</td><td className="timetable-admin-actions"><button className="admin-action-button" onClick={() => resetPassword(admin.user_id, admin.display_name)}><KeyRound size={14}/> Set new password</button><button className="admin-action-button admin-action-danger" onClick={() => remove(admin.user_id, admin.display_name)}><Trash2 size={14}/> Delete</button></td></tr>)}</tbody></table></div> : <div className="admin-empty"><Users size={27}/><h2>No department administrators</h2><p>Add an administrator to give a department its own content-management access.</p></div>}
    </section>
    {showForm && <div className="admin-editor-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowForm(false); }}><form className="admin-editor" onSubmit={submit}><div className="editor-heading"><div><p className="section-kicker">New account</p><h2>Create Department Administrator</h2></div><button type="button" onClick={() => setShowForm(false)} aria-label="Close editor">×</button></div><p className="editor-context">Set the department administrator's login password. The invitation email verifies the account and opens its generated department portal; only the Faculty super administrator can change this password.</p><div className="editor-fields"><label><span>Full name <b>*</b></span><input required value={form.displayName} onChange={event => setForm({ ...form, displayName: event.target.value })}/></label><label><span>Login name <b>*</b></span><input required pattern="[a-z0-9._-]{3,64}" placeholder="admin-math" value={form.username} onChange={event => setForm({ ...form, username: event.target.value.toLowerCase() })}/><small>Use lowercase letters, numbers, dots, hyphens or underscores.</small></label><label><span>Email address <b>*</b></span><input required type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })}/></label><label><span>Default password <b>*</b></span><input required type="password" autoComplete="new-password" minLength={8} maxLength={256} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })}/><small>At least 8 characters, including a special character.</small></label><label><span>Confirm default password <b>*</b></span><input required type="password" autoComplete="new-password" minLength={8} maxLength={256} value={form.confirmPassword} onChange={event => setForm({ ...form, confirmPassword: event.target.value })}/></label><label><span>Department <b>*</b></span><select required value={form.departmentId} onChange={event => setForm({ ...form, departmentId: event.target.value })}><option value="">— Select department —</option>{departments.map(department => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label><label><span>Permissions</span><input value="Full Department Management" disabled /></label></div><div className="editor-actions"><button type="button" className="button button-quiet" onClick={() => setShowForm(false)}>Cancel</button><button className="button button-primary" disabled={saving}>{saving ? <LoaderCircle className="spin" size={15}/> : <KeyRound size={15}/>} {saving ? "Creating…" : "Create administrator"}</button></div></form></div>}
  </main>;
}
