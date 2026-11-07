import React, { useState } from "react";
import { api, readApiError } from "../lib/api";

/**
 * ContactPage Component
 * 
 * Provides a sleek contact inquiry interface communicating directly with
 * the backend notification service and automated email delivery.
 */
export const ContactPage: React.FC = () => {
  const [senderName, setSenderName] = useState<string>("");
  const [senderEmail, setSenderEmail] = useState<string>("");
  const [messageContent, setMessageContent] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccessMessage, setSubmissionSuccessMessage] = useState<string | null>(null);
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState<string | null>(null);

  /**
   * Submits the inquiry to the backend REST API endpoint.
   */
  const handleContactSubmit = async (formSubmitEvent: React.FormEvent<HTMLFormElement>): Promise<void> => {
    formSubmitEvent.preventDefault();
    setIsSubmitting(true);
    setSubmissionSuccessMessage(null);
    setSubmissionErrorMessage(null);

    try {
      const response = await api.post<{ message: string }>("/contact", {
        name: senderName.trim(),
        email: senderEmail.trim(),
        message: messageContent.trim(),
      });

      setSubmissionSuccessMessage(
        response.data.message || "Thank you! Your message was received and an email confirmation is on its way."
      );
      setSenderName("");
      setSenderEmail("");
      setMessageContent("");
    } catch (apiError) {
      setSubmissionErrorMessage(readApiError(apiError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 page-enter space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
          ✉️ Direct Developer Support
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
          Contact the SliceForge Team
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Need a custom export format, found a boundary alignment edge-case, or have a
          feature request? Send us a message and our automated notification system will route it to our engineering team.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md space-y-6">
        {submissionSuccessMessage && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-emerald-300 text-sm flex items-start gap-3">
            <span className="text-lg">✓</span>
            <div>
              <p className="font-semibold">Message Dispatched Successfully</p>
              <p className="text-xs text-emerald-400/90 mt-0.5">{submissionSuccessMessage}</p>
            </div>
          </div>
        )}

        {submissionErrorMessage && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-red-300 text-sm flex items-start gap-3">
            <span className="text-lg">⚠</span>
            <div>
              <p className="font-semibold">Unable to Send Message</p>
              <p className="text-xs text-red-400/90 mt-0.5">{submissionErrorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={(formSubmitEvent) => void handleContactSubmit(formSubmitEvent)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-medium text-slate-300 mb-1.5">
                Your Full Name <span className="text-cyan-400">*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                required
                maxLength={120}
                value={senderName}
                onChange={(changeEvent) => setSenderName(changeEvent.target.value)}
                placeholder="Ada Lovelace"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Your Email Address <span className="text-cyan-400">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                required
                maxLength={255}
                value={senderEmail}
                onChange={(changeEvent) => setSenderEmail(changeEvent.target.value)}
                placeholder="developer@example.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="contact-message" className="block text-xs font-medium text-slate-300">
                Inquiry or Feedback Message <span className="text-cyan-400">*</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {messageContent.length} / 5000 characters
              </span>
            </div>
            <textarea
              id="contact-message"
              required
              rows={6}
              maxLength={5000}
              value={messageContent}
              onChange={(changeEvent) => setMessageContent(changeEvent.target.value)}
              placeholder="Describe your question, request, or sprite sheet details..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-3 px-4 text-sm font-bold shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Dispatching Your Message...</span>
              </>
            ) : (
              <span>Send Message ✉️</span>
            )}
          </button>
        </form>

        <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 font-mono">
          <span>Ultra-Fast Cloud Delivery</span>
          <span>Dual Notification: Team Inbox + Sender Receipt</span>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
