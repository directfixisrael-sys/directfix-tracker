import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Phone, Mail, Upload, CheckCircle2, Wrench, Smartphone, Shield, Zap, MapPin, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const TechnicianRecruitment = () => {
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [experience, setExperience] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const features = [
    { icon: Zap, text: 'תנאים נוחים' },
    { icon: Shield, text: 'עבודה בחברה עם וותק וניסיון' },
    { icon: MapPin, text: 'תהיה בעל הבית של עצמך' },
    { icon: Wrench, text: 'חלפים מקוריים ואיכותיים' },
  ];

  const floatingIcons = [
    { Icon: Wrench, size: 'w-10 h-10', position: 'top-[15%] right-[10%]', delay: '0s', bg: 'bg-card' },
    { Icon: Smartphone, size: 'w-12 h-12', position: 'top-[35%] right-[25%]', delay: '1s', bg: 'bg-card' },
    { Icon: Shield, size: 'w-9 h-9', position: 'top-[55%] right-[8%]', delay: '2s', bg: 'bg-card' },
    { Icon: Zap, size: 'w-11 h-11', position: 'top-[70%] right-[22%]', delay: '3s', bg: 'bg-card' },
  ];

  const canProceed = () => {
    switch (step) {
      case 0: return name.trim().length >= 2;
      case 1: return experience.trim().length > 0;
      case 2: return phone.replace(/\D/g, '').length >= 9 && email.includes('@');
      case 3: return true; // resume is optional
      case 4: return privacyAccepted;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!privacyAccepted) return;
    setIsSubmitting(true);

    try {
      let resumeUrl = '';
      let resumeFileName = '';

      if (resumeFile) {
        resumeFileName = resumeFile.name;
        const filePath = `${Date.now()}_${resumeFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, resumeFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error('שגיאה בהעלאת קורות החיים');
        } else {
          const { data: urlData } = supabase.storage
            .from('resumes')
            .getPublicUrl(filePath);
          resumeUrl = urlData.publicUrl;
        }
      }

      await supabase.functions.invoke('send-technician-application', {
        body: {
          name: name.trim(),
          experience: experience.trim(),
          phone: phone.trim(),
          email: email.trim(),
          resumeUrl,
          resumeFileName,
        },
      });

      setIsSubmitted(true);
      toast.success('הבקשה נשלחה בהצלחה!');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('שגיאה בשליחת הבקשה, נסו שוב');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormStep = () => {
    const inputClass = "h-14 text-lg rounded-xl bg-card border-2 border-primary/20 focus:border-primary";
    
    switch (step) {
      case 0:
        return (
          <div className="space-y-3 animate-slide-up">
            <label className="text-sm font-bold text-background/90">שם מלא</label>
            <Input
              placeholder="הכנס את שמך המלא"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              autoFocus
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-3 animate-slide-up">
            <label className="text-sm font-bold text-background/90">שנות ניסיון</label>
            <Input
              placeholder="כמה שנות ניסיון יש לך?"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className={inputClass}
              autoFocus
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-3 animate-slide-up">
            <label className="text-sm font-bold text-background/90">פרטי התקשרות</label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="מספר טלפון"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${inputClass} pr-11`}
                dir="ltr"
                autoFocus
              />
            </div>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="כתובת אימייל"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} pr-11`}
                dir="ltr"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-3 animate-slide-up">
            <label className="text-sm font-bold text-background/90">קורות חיים (לא חובה)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-28 rounded-xl border-2 border-dashed border-primary/30 bg-card hover:bg-card/80 flex flex-col items-center justify-center gap-2 transition-colors"
            >
              {resumeFile ? (
                <>
                  <FileText className="w-8 h-8 text-primary" />
                  <span className="text-sm font-medium text-foreground">{resumeFile.name}</span>
                  <span className="text-xs text-muted-foreground">לחץ להחלפה</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-primary/60" />
                  <span className="text-sm text-muted-foreground">לחץ להעלאת קובץ PDF / DOC</span>
                </>
              )}
            </button>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-slide-up">
            <div className="flex items-start gap-3 bg-card rounded-xl p-4">
              <Checkbox
                id="privacy"
                checked={privacyAccepted}
                onCheckedChange={(checked) => setPrivacyAccepted(checked === true)}
                className="mt-1"
              />
              <label htmlFor="privacy" className="text-sm text-foreground leading-relaxed cursor-pointer">
                אני מאשר/ת את <strong>מדיניות הפרטיות</strong> ומסכים/ה שהפרטים שלי ישמרו לצורך תהליך הגיוס בלבד.
                המידע לא יועבר לצדדים שלישיים ויימחק בתום התהליך.
              </label>
            </div>
          </div>
        );
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl mx-4 mb-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/95 to-foreground/85" />
      
      <div className="relative grid grid-cols-1 md:grid-cols-2 min-h-[420px]">
        {/* Left side - Floating icons */}
        <div className="hidden md:block relative">
          {floatingIcons.map(({ Icon, size, position, delay, bg }, i) => (
            <div
              key={i}
              className={`absolute ${position} ${size} ${bg} rounded-2xl shadow-lg flex items-center justify-center`}
              style={{
                animation: `techFloat 6s ease-in-out ${delay} infinite`,
                transform: `rotate(${(i * 15) - 15}deg)`,
              }}
            >
              <Icon className="w-5 h-5 text-primary" />
            </div>
          ))}
        </div>

        {/* Right side - Content */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          {isSubmitted ? (
            <div className="text-center animate-slide-up space-y-4">
              <div className="w-20 h-20 bg-background/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-background" />
              </div>
              <h3 className="text-2xl font-extrabold text-background">הבקשה נשלחה!</h3>
              <p className="text-background/80">תודה {name}, ניצור איתך קשר בהקדם.</p>
            </div>
          ) : !showForm ? (
            <>
              <h2 className="text-3xl md:text-4xl font-extrabold text-background mb-4 leading-tight">
                אתה טכנאי סלולר?
                <br />
                הצטרף לצוות דיירקט פיקס!
              </h2>
              <p className="text-background/80 text-lg mb-6">
                אנחנו מחפשים טכנאים מנוסים ומקצועיים. הצטרף למעבדה המובילה בישראל.
              </p>
              
              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-8">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-background/15 border border-background/25 rounded-full px-4 py-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-background/80" />
                    <span className="text-sm font-medium text-background">{f.text}</span>
                  </div>
                ))}
              </div>

              {/* Mobile floating icons - show horizontally */}
              <div className="flex md:hidden items-center justify-center gap-4 mb-6">
                {floatingIcons.map(({ Icon, delay }, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 bg-primary rounded-2xl shadow-lg flex items-center justify-center"
                    style={{
                      animation: `techFloat 6s ease-in-out ${delay} infinite`,
                      transform: `rotate(${(i * 12) - 18}deg)`,
                    }}
                  >
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                ))}
              </div>

              <Button
                onClick={() => { setShowForm(true); setStep(0); }}
                className="w-full md:w-auto h-14 px-10 rounded-2xl text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                הגש בקשה
              </Button>
            </>
          ) : (
            <div className="space-y-5">
              {/* Progress dots */}
              <div className="flex items-center gap-2 mb-2">
                {[0, 1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      s === step ? 'w-8 bg-background' : s < step ? 'w-4 bg-background/60' : 'w-4 bg-background/20'
                    }`}
                  />
                ))}
              </div>

              {renderFormStep()}

              <div className="flex gap-3 pt-2">
                {step > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="h-12 px-6 rounded-xl bg-background/10 border-background/20 text-background hover:bg-background/20"
                  >
                    חזור
                  </Button>
                )}
                {step < 4 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex-1 h-12 rounded-xl bg-card text-foreground hover:bg-card/90 font-bold text-base gap-2"
                  >
                    המשך
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!privacyAccepted || isSubmitting}
                    className="flex-1 h-12 rounded-xl bg-card text-foreground hover:bg-card/90 font-bold text-base gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        שולח...
                      </>
                    ) : (
                      'שלח בקשה'
                    )}
                  </Button>
                )}
              </div>

              <button
                onClick={() => { setShowForm(false); setStep(0); }}
                className="text-xs text-primary-foreground/50 underline w-full text-center"
              >
                ביטול
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CSS for floating animation */}
      <style>{`
        @keyframes techFloat {
          0%, 100% { transform: translateY(0) rotate(var(--rotate, 0deg)); }
          25% { transform: translateY(-12px) rotate(calc(var(--rotate, 0deg) + 5deg)); }
          50% { transform: translateY(-6px) rotate(calc(var(--rotate, 0deg) - 3deg)); }
          75% { transform: translateY(-15px) rotate(calc(var(--rotate, 0deg) + 8deg)); }
        }
      `}</style>
    </section>
  );
};

export default TechnicianRecruitment;
