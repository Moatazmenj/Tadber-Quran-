'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

const CLINIC_STORAGE_KEY = 'spiritualClinicStatus';

export function SpiritualClinicDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [feeling, setFeeling] = useState('');

  useEffect(() => {
    // This logic ensures the dialog appears on every new session/page load
    // but not repeatedly within the same session if the user closes it.
    const sessionStatus = sessionStorage.getItem(CLINIC_STORAGE_KEY);
    if (sessionStatus !== 'seen') {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem(CLINIC_STORAGE_KEY, 'seen');
      }, 1000); // Show after 1 second delay
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeling.trim()) return;
    setIsOpen(false);
    router.push(`/spiritual-clinic?feeling=${encodeURIComponent(feeling)}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader className="text-center items-center">
          <Image src="https://i.postimg.cc/T3mTt8kc/ai.png" alt="AI Icon" width={32} height={32} className="mb-2" />
          <DialogTitle className="text-2xl">العيادة الروحية</DialogTitle>
          <DialogDescription className="text-base">
            دع القرآن يكون طبيبك. صف لنا ما تشعر به، وسنقدم لك وصفة إيمانية لراحة قلبك.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label htmlFor="feeling-dialog" className="sr-only">ماذا تشعر به الآن؟</label>
            <Textarea
              id="feeling-dialog"
              placeholder="صف شعورك هنا... مثلاً: أشعر بالقلق، بالحزن، بالضياع..."
              rows={3}
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              className="text-base"
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={!feeling.trim()}>
              ابحث عن وصفتي الإيمانية
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
