import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Profile() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const profileQuery = trpc.profile.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateProfileMutation = trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      profileQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const [formData, setFormData] = useState({
    fullName: profileQuery.data?.fullName || "",
    university: profileQuery.data?.university || "",
    major: profileQuery.data?.major || "",
    year: profileQuery.data?.year || "",
    gpa: profileQuery.data?.gpa || "",
    researchInterests: profileQuery.data?.researchInterests || "",
    skills: profileQuery.data?.skills || "",
    pastExperience: profileQuery.data?.pastExperience || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Please log in to continue</p>
          <Button onClick={() => setLocation("/")} variant="default">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black">My Profile</h1>
            <p className="text-sm text-muted-foreground">Personalize your outreach emails with your information</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {profileQuery.isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="max-w-2xl">
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">University</label>
                    <Input
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      placeholder="Your university"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Major</label>
                    <Input
                      name="major"
                      value={formData.major}
                      onChange={handleChange}
                      placeholder="Your major"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Year</label>
                    <Input
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      placeholder="e.g., Junior, 2nd Year"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">GPA</label>
                    <Input
                      name="gpa"
                      value={formData.gpa}
                      onChange={handleChange}
                      placeholder="e.g., 3.8"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Research Interests</label>
                  <Textarea
                    name="researchInterests"
                    value={formData.researchInterests}
                    onChange={handleChange}
                    placeholder="Describe your research interests and goals"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Skills</label>
                  <Textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="List your technical and research skills (e.g., Python, machine learning, data analysis)"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Past Experience</label>
                  <Textarea
                    name="pastExperience"
                    value={formData.pastExperience}
                    onChange={handleChange}
                    placeholder="Describe relevant research experience, internships, or projects"
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-accent text-accent-foreground"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
