import { toast } from '@/components/ui/toast';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function useToast() {
  return {
    toast: (props: ToastProps) => {
      if (props.variant === 'destructive') {
        toast(props.title || 'Error', { type: 'error', description: props.description });
      } else {
        toast(props.title || 'Success', { type: 'success', description: props.description });
      }
    },
  };
}
