
import { format } from 'date-fns';

// Generate a shareable link with state encoded in query parameters
export const generateShareableLink = (): string => {
  const url = new URL(window.location.href);
  url.searchParams.set('shared', 'true');
  url.searchParams.set('timestamp', format(new Date(), 'yyyy-MM-dd_HH:mm'));
  return url.toString();
};

// Copy text to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

// Send email through mailto protocol
export const shareViaEmail = (subject: string, body: string): boolean => {
  try {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    window.location.href = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;
    return true;
  } catch (error) {
    console.error('Failed to share via email:', error);
    return false;
  }
};
