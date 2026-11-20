/* eslint-disable */
'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Shield, 
  Briefcase, 
  Phone, 
  CalendarDays, 
  KeyRound, 
  Bell, 
  Monitor, 
  Laptop,
  Globe, 
  CheckCircle2, 
  Lock, 
  Smartphone, 
  Sparkles, 
  Activity, 
  Save, 
  Loader2, 
  Moon, 
  Sun, 
  ShieldCheck, 
  History,
  Check,
  AlertCircle
} from 'lucide-react';
import { updateProfileInfo, updatePassword } from '@/app/dashboard/profile/actions';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-primary text-primary-foreground',
  MANAGER: 'bg-amber-600 text-white',
  SUPERVISOR: 'bg-blue-600 text-white',
  CASHIER: 'bg-emerald-600 text-white',
  ATTENDANT: 'bg-slate-600 text-white',
};

interface ProfileClientProps {
  profile: {
    id: string;
    full_name: string;
    email: string | null;
    role_name: string;
    status: string;
    employee_id: string | null;
    created_at: string;
  } | null;
  employeeData: {
    employee_code?: string;
    phone?: string;
    position?: string;
    hire_date?: string;
  } | null;
}

export function ProfileClient({ profile, employeeData }: ProfileClientProps) {
  const { toast } = useToast();
  const [isPendingProfile, startTransitionProfile] = useTransition();
  const [isPendingPassword, startTransitionPassword] = useTransition();
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'preferences' | 'activity'>('general');

  // General Form States
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(employeeData?.phone || '');
  const [position, setPosition] = useState(employeeData?.position || '');

  // Password Form States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preference Toggles
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    emailSummary: true,
    lowStockAlert: true,
    discrepancyWarning: true,
    shiftHandoverReminder: false,
  });

  const roleBadgeClass = ROLE_COLORS[profile?.role_name || ''] || 'bg-muted text-muted-foreground';

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('full_name', fullName);
    formData.append('phone', phone);
    formData.append('position', position);

    startTransitionProfile(async () => {
      const res = await updateProfileInfo(formData);
      if (res.success) {
        toast({
          title: 'Profile Updated',
          description: 'Your personal profile information has been saved.',
        });
      } else {
        toast({
          title: 'Update Failed',
          description: res.error || 'Failed to update profile.',
          variant: 'destructive',
        });
      }
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'New password and confirmation password do not match.',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('new_password', newPassword);
    formData.append('confirm_password', confirmPassword);

    startTransitionPassword(async () => {
      const res = await updatePassword(formData);
      if (res.success) {
        toast({
          title: 'Password Changed',
          description: 'Your password has been successfully updated.',
        });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast({
          title: 'Password Update Failed',
          description: res.error || 'Could not update password.',
          variant: 'destructive',
        });
      }
    });
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-red-500 text-red-500' };
    if (pass.length < 10) return { score: 2, label: 'Medium', color: 'bg-amber-500 text-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500 text-emerald-500' };
  };

  const passStrength = getPasswordStrength(newPassword);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 via-primary to-primary/80 p-6 md:p-8 text-primary-foreground shadow-xl">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Sparkles className="h-64 w-64" />
        </div>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <Avatar className="h-28 w-28 ring-4 ring-white/20 shadow-lg">
            <AvatarImage src="" alt={profile?.full_name || 'User'} />
            <AvatarFallback className="text-4xl bg-white/20 text-white font-bold backdrop-blur-sm">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight">{profile?.full_name || 'User Profile'}</h1>
              <Badge className={`${roleBadgeClass} shadow-sm px-3 py-0.5 text-xs font-semibold uppercase tracking-wider`}>
                {profile?.role_name || 'USER'}
              </Badge>
              <Badge variant="outline" className="bg-emerald-500/20 text-white border-emerald-400/30 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                {profile?.status || 'ACTIVE'}
              </Badge>
            </div>
            
            <p className="text-primary-foreground/80 text-sm max-w-xl">
              Manage your personal credentials, contact info, security preferences, and system notification settings.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-primary-foreground/70">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {profile?.email || 'N/A'}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> ID: {employeeData?.employee_code || profile?.id?.substring(0, 8)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Role & Permissions</p>
              <p className="text-sm font-bold">{profile?.role_name || 'Standard User'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Designation</p>
              <p className="text-sm font-bold">{employeeData?.position || profile?.role_name || 'Staff'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Contact Phone</p>
              <p className="text-sm font-bold">{employeeData?.phone || 'Not Provided'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Member Since</p>
              <p className="text-sm font-bold">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs (General Components Container) */}
      <div className="space-y-6">
        <div className="flex border-b border-border gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            <User className="h-4 w-4" />
            General Info
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            <KeyRound className="h-4 w-4" />
            Security & Password
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'preferences'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            <Bell className="h-4 w-4" />
            Preferences & Alerts
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'activity'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
            }`}
          >
            <History className="h-4 w-4" />
            Activity Log
          </button>
        </div>

        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <form onSubmit={handleProfileSubmit}>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" /> Personal Information
                </CardTitle>
                <CardDescription>
                  Update your display name and contact details. System role and email are read-only.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-semibold">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="full_name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter full name"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">
                      Email Address (Read-Only)
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={profile?.email || ''}
                        disabled
                        className="pl-9 bg-muted/50 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +94 77 123 4567"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-semibold">
                      Job Position / Title
                    </Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="position"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="e.g. Senior Station Operator"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employee_code" className="text-sm font-semibold">
                      Employee Code
                    </Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="employee_code"
                        value={employeeData?.employee_code || 'EMP-0000'}
                        disabled
                        className="pl-9 bg-muted/50 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hire_date" className="text-sm font-semibold">
                      Hire Date
                    </Label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="hire_date"
                        value={
                          employeeData?.hire_date
                            ? new Date(employeeData.hire_date).toLocaleDateString()
                            : 'N/A'
                        }
                        disabled
                        className="pl-9 bg-muted/50 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end border-t border-border pt-4">
                <Button type="submit" disabled={isPendingProfile} className="gap-2">
                  {isPendingProfile ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <form onSubmit={handlePasswordSubmit}>
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" /> Update Password
                  </CardTitle>
                  <CardDescription>
                    Ensure your account is using a strong password to protect station data.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 max-w-xl">
                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new_password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-9"
                        required
                      />
                    </div>
                    {newPassword && (
                      <div className="flex items-center gap-2 text-xs pt-1">
                        <span className="text-muted-foreground">Strength:</span>
                        <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              passStrength.score === 1
                                ? 'w-1/3 bg-red-500'
                                : passStrength.score === 2
                                ? 'w-2/3 bg-amber-500'
                                : 'w-full bg-emerald-500'
                            }`}
                          />
                        </div>
                        <span className={`font-semibold ${passStrength.color}`}>{passStrength.label}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm_password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end border-t border-border pt-4">
                  <Button type="submit" disabled={isPendingPassword} className="gap-2">
                    {isPendingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>

            {/* Active Sessions */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" /> Active Login Sessions
                </CardTitle>
                <CardDescription>Devices currently signed in to your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                      <Laptop className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold flex items-center gap-2">
                        Current Web Session
                        <Badge className="bg-emerald-500 text-white text-[10px] py-0 px-1.5">Active Now</Badge>
                      </p>
                      <p className="text-xs text-muted-foreground">Chrome on Windows • Colombo, LK</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 3: System Preferences & Alerts */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" /> Display & Language
                </CardTitle>
                <CardDescription>Customize your workspace appearance and regional settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Theme Mode</Label>
                  <div className="grid grid-cols-3 gap-4 max-w-md">
                    <button
                      type="button"
                      onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        preferences.theme === 'light'
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 font-semibold'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <Sun className="h-6 w-6 text-amber-500" />
                      <span className="text-xs">Light (Default)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        preferences.theme === 'dark'
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 font-semibold'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <Moon className="h-6 w-6 text-indigo-500" />
                      <span className="text-xs">Dark Mode</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreferences({ ...preferences, theme: 'system' })}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        preferences.theme === 'system'
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 font-semibold'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <Monitor className="h-6 w-6 text-slate-500" />
                      <span className="text-xs">System</span>
                    </button>
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div className="space-y-3 max-w-md">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" /> System Language
                  </Label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="en">English (US)</option>
                    <option value="si">Sinhala (සිංහල)</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" /> Notification Preferences
                </CardTitle>
                <CardDescription>Manage automated alerts for daily sales, meter readings, and stock.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-semibold">Daily Sales Summary Email</p>
                    <p className="text-xs text-muted-foreground">Receive end-of-day revenue & collection summary.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailSummary}
                    onChange={(e) => setPreferences({ ...preferences, emailSummary: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-semibold">Low Fuel Stock Alerts</p>
                    <p className="text-xs text-muted-foreground">Instant alert when tank volume falls below threshold.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.lowStockAlert}
                    onChange={(e) => setPreferences({ ...preferences, lowStockAlert: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-semibold">Meter Discrepancy Warnings</p>
                    <p className="text-xs text-muted-foreground">Notify when pump meter sales mismatch cash collected.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.discrepancyWarning}
                    onChange={(e) => setPreferences({ ...preferences, discrepancyWarning: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end border-t border-border pt-4">
                <Button 
                  onClick={() => toast({ title: 'Preferences Saved', description: 'Your alert settings have been updated.' })}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" /> Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Tab 4: Activity Log */}
        {activeTab === 'activity' && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> System Activity History
              </CardTitle>
              <CardDescription>Audit log of recent operations performed by your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative border-l-2 border-primary/20 pl-6 space-y-6 ml-3">
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 p-1 bg-primary text-primary-foreground rounded-full">
                    <Check className="h-3 w-3" />
                  </div>
                  <p className="text-sm font-semibold">Logged Daily Pump Meter Readings</p>
                  <p className="text-xs text-muted-foreground">Petrol 92 (Pump #01) & Auto Diesel (Pump #02)</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">Today at 08:30 AM</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0 p-1 bg-amber-500 text-white rounded-full">
                    <Sparkles className="h-3 w-3" />
                  </div>
                  <p className="text-sm font-semibold">Updated Petrol 92 Fuel Price</p>
                  <p className="text-xs text-muted-foreground">Adjusted unit price to Rs. 300.00 / Litre</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">Yesterday at 05:15 PM</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0 p-1 bg-blue-500 text-white rounded-full">
                    <ShieldCheck className="h-3 w-3" />
                  </div>
                  <p className="text-sm font-semibold">System Sign In</p>
                  <p className="text-xs text-muted-foreground">Authenticated successfully from Chrome Windows</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">2 days ago at 09:00 AM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export { ProfileClient as ProfileForm };

