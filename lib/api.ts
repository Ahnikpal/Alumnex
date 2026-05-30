/**
 * Alumnex API helpers
 * Shared fetch utilities for all frontend components
 */

const API_BASE = 'http://localhost:5000';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ApiInternship {
    internship_id: number;
    company: string;
    role: string;
    location: string | null;
    duration: string | null;
    stipend: string | null;
    posted_at: string;
    posted_by_id: number | null;
    posted_by_name: string | null;
    posted_by_company: string | null;
    logo_url?: string;
    description?: string;
    status?: 'Active' | 'Draft' | 'Closed';
    deadline?: string | null;
    application_count?: number;
}

export interface ApiApplication {
    application_id: number;
    status: 'pending' | 'under_review' | 'shortlisted' | 'rejected' | 'accepted';
    applied_date: string;
    student_id: number;
    student_name: string;
    student_email: string;
    college: string;
    internship_id: number;
    company: string;
    role: string;
    internship_location: string | null;
    student_cgpa?: string;
    student_dept?: string;
}

export interface ApiAlumni {
    alumni_id: number;
    name: string;
    email: string;
    password?: string;
    company: string;
    branch?: string;
    role: string;
    graduation_year: number | null;
    cgpa?: number | null;
    location: string | null;
    linkedin?: string | null;
    bio?: string | null;
    skills?: string | null;
    profile_picture?: string | null;
    created_at: string;
}

export interface ApiStudent {
    student_id: number;
    name: string;
    email: string;
    password?: string;
    college?: string;
    branch?: string;
    cgpa?: number;
    location?: string;
    created_at?: string;
    about_me?: string;
    skills?: string;
    github_link?: string;
    linkedin_link?: string;
    portfolio_link?: string;
    resume_url?: string;
    profile_picture?: string;
    identity_url?: string;
}

export interface ApiReferral {
    referral_id: number;
    message: string | null;
    status: 'pending' | 'accepted' | 'rejected';
    request_date: string;
    student_id: number;
    student_name: string;
    alumni_id: number;
    alumni_name: string;
    alumni_company: string;
    internship_id: number;
    internship_company: string;
    internship_role: string;
    resume_url?: string | null;
    student_cgpa?: string;
    student_dept?: string;
}

export interface ApiNotification {
    notification_id: number;
    user_id: number;
    user_type: 'student' | 'alumni';
    title: string;
    message: string | null;
    related_id: number | null;
    related_type: string | null;
    is_read: boolean;
    created_at: string;
}

// ── Fetch helpers ────────────────────────────────────────────────────────────

export async function fetchInternships(): Promise<ApiInternship[]> {
    const res = await fetch(`${API_BASE}/internships`);
    if (!res.ok) throw new Error('Failed to fetch internships');
    return res.json();
}

export async function deleteInternship(internship_id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/internships/${internship_id}`, { method: 'DELETE' });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete internship');
    }
    return res.json();
}

export async function updateInternshipStatus(
    internship_id: number,
    status: 'Active' | 'Draft' | 'Closed'
): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/internships/${internship_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update internship status');
    }
    return res.json();
}

export async function createInternship(data: {
    company: string;
    role: string;
    location?: string;
    duration?: string;
    stipend?: string;
    posted_by?: number;
    description?: string;
    logo_file?: File;
}): Promise<{ message: string; internship_id: number; logo_url?: string }> {
    const formData = new FormData();
    formData.append('company', data.company);
    formData.append('role', data.role);
    if (data.location) formData.append('location', data.location);
    if (data.duration) formData.append('duration', data.duration);
    if (data.stipend) formData.append('stipend', data.stipend);
    if (data.posted_by) formData.append('posted_by', data.posted_by.toString());
    if (data.description) formData.append('description', data.description);
    if (data.logo_file) formData.append('company_logo', data.logo_file);

    const res = await fetch(`${API_BASE}/internships`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create internship');
    }
    return res.json();
}

export async function fetchInternshipById(id: number): Promise<ApiInternship> {
    const res = await fetch(`${API_BASE}/internships/${id}`);
    if (!res.ok) throw new Error('Failed to fetch internship');
    return res.json();
}

export async function updateInternship(id: number, data: Partial<ApiInternship>): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/internships/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update internship');
    }
    return res.json();
}

export async function fetchApplications(alumni_id?: number, student_id?: number): Promise<ApiApplication[]> {
    const params = new URLSearchParams();
    if (alumni_id) params.append('alumni_id', alumni_id.toString());
    if (student_id) params.append('student_id', student_id.toString());
    
    const url = `${API_BASE}/applications${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
}

export async function updateApplicationStatus(
    application_id: number,
    status: ApiApplication['status']
): Promise<{ message: string; status: string }> {
    const res = await fetch(`${API_BASE}/applications/${application_id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update application status');
    }
    return res.json();
}

export async function fetchAlumni(): Promise<ApiAlumni[]> {
    const res = await fetch(`${API_BASE}/alumni`);
    if (!res.ok) throw new Error('Failed to fetch alumni');
    return res.json();
}

export async function fetchAlumniById(alumni_id: number): Promise<ApiAlumni> {
    const res = await fetch(`${API_BASE}/alumni/${alumni_id}`);
    if (!res.ok) throw new Error('Failed to fetch alumni profile');
    return res.json();
}

export async function updateAlumni(
    alumni_id: number,
    data: Partial<Pick<ApiAlumni, 'name' | 'company' | 'role' | 'graduation_year' | 'location' | 'linkedin' | 'bio' | 'skills'>>
): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/alumni/${alumni_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error || 'Failed to update profile');
    }
    return res.json();
}

export async function uploadAlumniProfilePicture(alumni_id: number, file: File): Promise<{ profile_picture: string }> {
    const formData = new FormData();
    formData.append('profile_picture', file);

    const res = await fetch(`${API_BASE}/alumni/${alumni_id}/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error || 'Failed to upload profile picture');
    }
    return res.json();
}

export async function fetchStudents(): Promise<ApiStudent[]> {
    const res = await fetch(`${API_BASE}/students`);
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
}

export async function fetchStudentById(id: number): Promise<ApiStudent> {
    const res = await fetch(`${API_BASE}/students/${id}`);
    if (!res.ok) throw new Error('Failed to fetch student details');
    return res.json();
}

export async function login(credentials: {
    email: string;
    password: string;
    userType: 'student' | 'alumni';
}): Promise<{ message: string; user: any }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Login failed');
    }
    return res.json();
}

export async function updateStudent(
    student_id: number,
    data: Partial<ApiStudent>
): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/students/${student_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update student profile');
    }
    return res.json();
}

export async function uploadStudentFiles(
    student_id: number,
    files: { profile_picture?: File; identity_url?: File; resume?: File }
): Promise<{ profile_picture?: string; identity_url?: string; resume_url?: string }> {
    const formData = new FormData();
    if (files.profile_picture) formData.append('profile_picture', files.profile_picture);
    if (files.identity_url) formData.append('identity_url', files.identity_url);
    if (files.resume) formData.append('resume', files.resume);

    const res = await fetch(`${API_BASE}/students/${student_id}/upload`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to upload files');
    }
    return res.json();
}

export async function postApplication(
    student_id: number,
    internship_id: number
): Promise<{ message: string; application_id: number }> {
    const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id, internship_id, status: 'pending' }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to submit application');
    }
    return res.json();
}

export async function deleteApplication(application_id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/applications/${application_id}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to withdraw application');
    }
    return res.json();
}

export async function postReferral(data: {
    student_id: number;
    alumni_id: number;
    internship_id: number;
    message?: string;
    resume?: File | null;
}): Promise<{ message: string; referral_id: number }> {
    const formData = new FormData();
    formData.append('student_id', data.student_id.toString());
    formData.append('alumni_id', data.alumni_id.toString());
    formData.append('internship_id', data.internship_id.toString());
    if (data.message) formData.append('message', data.message);
    if (data.resume) formData.append('resume', data.resume);

    const res = await fetch(`${API_BASE}/referrals`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create referral');
    }
    return res.json();
}

export async function fetchNotifications(user_id: number, user_type: 'student' | 'alumni'): Promise<ApiNotification[]> {
    const res = await fetch(`${API_BASE}/notifications?user_id=${user_id}&user_type=${user_type}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
}

export async function markNotificationRead(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to mark notification as read');
    return res.json();
}

export async function markAllNotificationsRead(user_id: number, user_type: 'student' | 'alumni'): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, user_type }),
    });
    if (!res.ok) throw new Error('Failed to mark all as read');
    return res.json();
}

export async function fetchReferrals(alumni_id?: number): Promise<ApiReferral[]> {
    const url = alumni_id ? `${API_BASE}/referrals?alumni_id=${alumni_id}` : `${API_BASE}/referrals`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch referrals');
    return res.json();
}

export async function fetchReferralById(id: number): Promise<ApiReferral> {
    const res = await fetch(`${API_BASE}/referrals/${id}`);
    if (!res.ok) throw new Error('Failed to fetch referral details');
    return res.json();
}

export async function updateReferralStatus(
    referral_id: number,
    status: 'pending' | 'accepted' | 'rejected'
): Promise<{ message: string; status: string }> {
    const res = await fetch(`${API_BASE}/referrals/${referral_id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update referral status');
    }
    return res.json();
}

// ── Utility: format stipend ──────────────────────────────────────────────────

export function formatStipend(raw: string | null): string {
    if (!raw) return 'N/A';
    const n = parseInt(raw, 10);
    if (isNaN(n)) return raw;
    return `₹${(n / 1000).toFixed(0)}k/mo`;
}

// ── Utility: format date ─────────────────────────────────────────────────────

export function formatDate(iso: string | null | undefined): string {
    if (!iso || iso === "" || iso === "null") return '—';
    try {
        const date = new Date(iso);
        if (isNaN(date.getTime())) return '—';
        return date.toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    } catch {
        return '—';
    }
}

// ── Utility: map backend status to display status ────────────────────────────

export function mapStatus(s: ApiApplication['status']): string {
    const map: Record<string, string> = {
        pending: 'Applied',
        under_review: 'Under Review',
        shortlisted: 'Shortlisted',
        rejected: 'Rejected',
        accepted: 'Accepted',
    };
    return map[s] ?? s;
}
