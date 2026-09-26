/* eslint-disable */
import { toast } from '@/components/ui/toast';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function useToast() {
  return {
    toast: (props: ToastProps) => {
      // Base UI's `add()` accepts a SINGLE options object. Passing the title as a
      // separate first argument made the store spread a string, which produced a
      // toast with no `title`/`description`/`type` — i.e. a blank white box.
      toast.add({
        title: props.title || (props.variant === 'destructive' ? 'Error' : 'Success'),
        description: props.description,
        type: props.variant === 'destructive' ? 'error' : 'success',
      });
    },
  };
}
