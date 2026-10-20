/**
 * The site-wide enquiry dialog. Any "Book a free demo" / "Enquire" button opens
 * it, optionally with a course already chosen.
 */
export type EnquiryKind = 'demo' | 'counselling' | 'course' | 'corporate' | 'contact';

class EnquiryDialog {
	open = $state(false);
	kind = $state<EnquiryKind>('demo');
	courseId = $state('');

	show(opts: { kind?: EnquiryKind; courseId?: string } = {}) {
		this.kind = opts.kind ?? 'demo';
		this.courseId = opts.courseId ?? '';
		this.open = true;
	}

	close() {
		this.open = false;
	}
}

export const enquiry = new EnquiryDialog();
