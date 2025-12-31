
const FORMSPREE_URL = 'https://formspree.io/f/mzdbnkkz';

export const submitToFormspree = async (formType: string, data: any) => {
  try {
    // We filter out very large base64 strings to prevent Formspree payload errors
    // but keep the essential text data.
    const sanitizedData: any = { 
      formType,
      timestamp: new Date().toISOString(),
      ...data 
    };

    // Remove potentially huge binary data for the Formspree notification
    if (sanitizedData.imageUrl) sanitizedData.imageUrl = "[Image Data Attached]";
    if (sanitizedData.audioUrl) sanitizedData.audioUrl = "[Audio Data Attached]";
    if (sanitizedData.pdfUrl) sanitizedData.pdfUrl = "[PDF Data Attached]";
    if (sanitizedData.photoUrl) sanitizedData.photoUrl = "[Photo Data Attached]";

    const response = await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sanitizedData)
    });

    return response.ok;
  } catch (error) {
    console.error("Formspree Error:", error);
    return false;
  }
};
