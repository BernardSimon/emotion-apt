const PolicyModal = ({ open, onAgree, onCancel }: { open: boolean; onAgree: () => void; onCancel: () => void }) => {
  return (
    <div id="policy_modal" className={`modal ${open ? "modal-open" : ""}`}>
      <div className="modal-box w-11/12 md:w-2/3 max-w-5xl prose">
        <h3 className="font-bold text-2xl mb-6 text-center">EmotionAPT AI Policy</h3>

        <div className="space-y-6 text-sm leading-relaxed">
          <section className="space-y-2">
            <h4 className="font-semibold text-primary">1. Purpose</h4>
            <p>
              Emotion APT AI Consultant is designed to provide AI-assisted psychological support while ensuring user
              privacy and data security.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-semibold text-primary">2. AI Responsibility & Disclosure</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                The AI system does not have a legal obligation to disclose information unless explicitly permitted by
                the user
              </li>
              <li>Not a licensed mental health professional - should not substitute professional therapy</li>
              <li>Responses are pattern-based and do not constitute professional advice</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="font-semibold text-primary">3. AI Decision-making & Errors</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Users can flag/modify incorrect responses</li>
              <li>Error reporting mechanism available</li>
              <li>AI is not a legal entity</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="font-semibold text-primary">4. Ethical Use & Responsibilities</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>For general support only - not crisis intervention</li>
              <li>Users should provide accurate information</li>
              <li>Abuse will result in access restrictions</li>
            </ul>
          </section>
        </div>

        <div className="modal-action mt-8">{/* 按钮保持不变 */}</div>
        <div className="modal-action">
          <button type="submit" className="btn btn-primary" onClick={onAgree}>
            Agree
          </button>
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;
