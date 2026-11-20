import React, { useMemo, useState } from "react";
import "./EventsEnquiry.css";

const EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Bridal shower",
  "Bachelor / Bachelorette celebration",
  "Private celebration",
  "Corporate event",
  "Wellness retreat",
  "Other",
];

const EXPERIENCE_TYPES = [
  {
    id: "relaxation",
    title: "Relaxation and spa",
    description: "Massages, foot treatments and relaxing spa experiences.",
    services: ["Swedish massage", "Deep tissue massage", "Aromatherapy massage", "Hot stone massage", "Back, neck and shoulder massage", "Foot massage and reflexology", "Head and scalp massage", "Foot soaks", "Body exfoliation"],
    extras: ["Mobile spa stations"],
  },
  {
    id: "beauty",
    title: "Beauty and pampering",
    description: "Facials, nail care and pampering experiences.",
    services: ["Express facials", "Luxury facials", "Manicures", "Pedicures", "Hand treatments", "Foot treatments", "Bridal pampering experiences"],
    extras: ["Bridal pampering experiences"],
  },
  {
    id: "wellness",
    title: "Wellness experience",
    description: "Wellness stations, chair massage and consultations.",
    services: ["Express chair massage", "Wellness consultations", "Aromatherapy experiences"],
    extras: ["Mobile spa stations", "Custom wellness packages"],
  },
  {
    id: "couples",
    title: "Couples experience",
    description: "Treatments and moments designed for couples.",
    services: ["Swedish massage", "Aromatherapy massage", "Hot stone massage", "Couples treatments"],
    extras: ["Couples treatments"],
  },
  {
    id: "custom",
    title: "Custom experience",
    description: "A tailored combination designed around your event.",
    services: [],
    extras: ["Custom wellness packages"],
  },
];

const SERVICE_GROUPS = [
  {
    title: "Massage experiences",
    items: [
      "Swedish massage",
      "Deep tissue massage",
      "Aromatherapy massage",
      "Hot stone massage",
      "Back, neck and shoulder massage",
      "Foot massage and reflexology",
      "Head and scalp massage",
      "Express chair massage",
    ],
  },
  {
    title: "Beauty and skincare",
    items: [
      "Express facials",
      "Luxury facials",
      "Manicures",
      "Pedicures",
      "Hand treatments",
      "Foot treatments",
    ],
  },
  {
    title: "Relaxation and wellness",
    items: [
      "Foot soaks",
      "Body exfoliation",
      "Aromatherapy experiences",
      "Wellness consultations",
    ],
  },
];

const STAGES = [
  "Your event",
  "Design your experience",
  "Scheduling and logistics",
  "Requirements and budget",
  "Your details",
];

const emptyForm = {
  attendance: "10",
  eventType: "",
  otherEventType: "",
  experienceTypes: [],
  experienceAddons: [],
  experienceDescription: "",
  dateChoice: "undecided",
  eventDate: "",
  venueName: "",
  venueAddress: "",
  venueConfirmed: "yes",
  services: {},
  startTime: "",
  endTime: "",
  treatmentSpace: "",
  accessDetails: "",
  parkingDetails: "",
  setupDetails: "",
  specialRequirements: "",
  budgetChoice: "quote",
  budgetAmount: "",
  additionalComments: "",
  fullName: "",
  phone: "",
  email: "",
  contactChannel: "whatsapp",
};

function Field({ label, hint, children, className = "" }) {
  return (
    <div className={`events-field ${className}`}>
      <label className="events-label">{label}</label>
      {hint && <p className="events-hint">{hint}</p>}
      {children}
    </div>
  );
}

function TextInput(props) {
  return <input className="events-input" {...props} />;
}

function TextArea(props) {
  return <textarea className="events-input events-textarea" {...props} />;
}

function ChoiceCard({ checked, onChange, children, description }) {
  return (
    <button
      type="button"
      className={`events-choice ${checked ? "is-selected" : ""}`}
      aria-pressed={checked}
      onClick={onChange}
    >
      <span className="events-choice-mark">{checked ? "✓" : ""}</span>
      <span>
        <span className="events-choice-title">{children}</span>
        {description && <span className="events-choice-description">{description}</span>}
      </span>
    </button>
  );
}

export default function EventsEnquiry({ onSubmit, onBack }) {
  const [stage, setStage] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [submitError, setSubmitError] = useState("");

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSubmitError("");
  };

  const selectedServiceCount = useMemo(
    () => Object.values(form.services).filter((item) => item.selected).length,
    [form.services]
  );

  const summary = useMemo(() => ({
    ...form,
    attendance: Number(form.attendance) || null,
    services: Object.entries(form.services)
      .filter(([, item]) => item.selected)
      .map(([name, item]) => ({
        name,
        quantity: item.quantity === "" ? null : Number(item.quantity) || null,
      })),
  }), [form]);

  const canContinue = () => {
    if (stage === 0) {
      return Boolean(
        Number(form.attendance) >= 9 &&
        Number(form.attendance) <= 500
      );
    }
    if (stage === 1) {
      return Boolean(
        form.eventType &&
        (form.eventType !== "Other" || form.otherEventType.trim()) &&
        (form.experienceTypes.length > 0 || form.experienceDescription.trim())
      );
    }
    if (stage === 4) {
      return Boolean(form.fullName.trim() && form.phone.trim() && form.email.trim());
    }
    return true;
  };

  const next = () => {
    if (!canContinue()) return;
    setStage((current) => Math.min(current + 1, STAGES.length - 1));
    setSubmitError("");
  };

  const back = () => {
    if (stage === 0) {
      onBack?.();
      return;
    }
    setStage((current) => Math.max(current - 1, 0));
    setSubmitError("");
  };

  const toggleExperienceType = (id) => {
    update(
      "experienceTypes",
      form.experienceTypes.includes(id)
        ? form.experienceTypes.filter((item) => item !== id)
        : [...form.experienceTypes, id]
    );
  };

  const toggleExperienceAddon = (name) => {
    update(
      "experienceAddons",
      form.experienceAddons.includes(name)
        ? form.experienceAddons.filter((item) => item !== name)
        : [...form.experienceAddons, name]
    );
  };

  const toggleService = (name) => {
    const current = form.services[name] || { selected: false, quantity: "10" };
    update("services", {
      ...form.services,
      [name]: { ...current, selected: !current.selected },
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!canContinue()) return;
    if (typeof onSubmit !== "function") {
      setSubmitError("The enquiry submission connection has not been set up yet.");
      return;
    }
    try {
      setSubmitError("");
      await onSubmit(summary);
    } catch {
      setSubmitError("We couldn't submit the enquiry. Please try again.");
    }
  };

  return (
    <section className="events-enquiry">
      <div className="events-shell">
        <div className="events-heading">
          <p className="events-eyebrow">Beauty Call · Events</p>
          <h1>Let's create an experience worth remembering.</h1>
          <p>Tell us a little about your event. We'll use the details to prepare a tailored proposal.</p>
        </div>

        <div className="events-progress" aria-label={`Stage ${stage + 1} of ${STAGES.length}`}>
          <div className="events-progress-track">
            <span style={{ width: `${((stage + 1) / STAGES.length) * 100}%` }} />
          </div>
          <div className="events-progress-meta">
            <span>Stage {stage + 1} of {STAGES.length}</span>
            <span>{STAGES[stage]}</span>
          </div>
        </div>

        <form onSubmit={submit}>
          {stage === 0 && (
            <div className="events-stage">
              <p className="events-step">01 / EVENT DETAILS</p>
              <h2>Tell us about your event</h2>
              <p className="events-intro">Start with the essentials. If some details are not confirmed yet, that's fine.</p>

              <Field label="Estimated total attendance" hint="An approximate number is perfectly fine. Not everyone attending needs to receive a Beauty Call service.">
                <div className="events-attendance-counter">
                  <button
                    type="button"
                    className="events-counter-button"
                    aria-label="Decrease attendance"
                    disabled={Number(form.attendance) <= 9}
                    onClick={() => update("attendance", String(Math.max(9, (Number(form.attendance) || 10) - 1)))}
                  >−</button>
                  <input
                    className="events-counter-value"
                    type="number"
                    min="9"
                    max="500"
                    value={form.attendance}
                    onChange={(e) => update("attendance", e.target.value === "" ? "" : String(Math.min(500, Math.max(9, Number(e.target.value) || 9))))}
                    aria-label="Estimated total attendance"
                  />
                  <button
                    type="button"
                    className="events-counter-button"
                    aria-label="Increase attendance"
                    disabled={Number(form.attendance) >= 500}
                    onClick={() => update("attendance", String(Math.min(500, (Number(form.attendance) || 10) + 1)))}
                  >+</button>
                </div>
              </Field>

              <Field label="When is the event?">
                <div className="events-choice-grid events-choice-grid-two">
                  <ChoiceCard checked={form.dateChoice === "undecided"} onChange={() => update("dateChoice", "undecided")}>Date to be confirmed</ChoiceCard>
                  <ChoiceCard checked={form.dateChoice === "known"} onChange={() => update("dateChoice", "known")}>I have a date</ChoiceCard>
                </div>
                {form.dateChoice === "known" && (
                  <TextInput type="date" value={form.eventDate} onChange={(e) => update("eventDate", e.target.value)} />
                )}
              </Field>

              <Field label="Venue name" hint="If you haven't chosen a venue, you can leave this blank.">
                <TextInput value={form.venueName} onChange={(e) => update("venueName", e.target.value)} placeholder="Venue or property name" />
              </Field>

              <Field label="Venue address or location" hint="A suburb or approximate location is enough if the exact venue is not confirmed.">
                <TextArea value={form.venueAddress} onChange={(e) => update("venueAddress", e.target.value)} placeholder="Venue address, suburb or area" />
              </Field>

              <Field label="Is the venue confirmed?">
                <div className="events-choice-grid events-choice-grid-two">
                  <ChoiceCard checked={form.venueConfirmed === "yes"} onChange={() => update("venueConfirmed", "yes")}>Yes</ChoiceCard>
                  <ChoiceCard checked={form.venueConfirmed === "no"} onChange={() => update("venueConfirmed", "no")}>Not yet</ChoiceCard>
                </div>
              </Field>
            </div>
          )}

          {stage === 1 && (
            <div className="events-stage">
              <p className="events-step">02 / EXPERIENCE DESIGN</p>
              <h2>Let's shape your event experience</h2>
              <p className="events-intro">First, tell us what you're celebrating. Then choose the kind of experience you'd like us to create.</p>

              <Field label="What kind of event are you planning?">
                <div className="events-choice-grid events-choice-grid-two">
                  {EVENT_TYPES.map((type) => (
                    <ChoiceCard key={type} checked={form.eventType === type} onChange={() => update("eventType", type)}>
                      {type}
                    </ChoiceCard>
                  ))}
                </div>
              </Field>

              {form.eventType === "Other" && (
                <Field label="What type of event is it?">
                  <TextInput value={form.otherEventType} onChange={(e) => update("otherEventType", e.target.value)} placeholder="Describe your event" />
                </Field>
              )}

              <Field label="What kind of experience would you like?" hint="Choose as many as you like. We'll show services relevant to your selections.">
                <div className="events-choice-grid events-choice-grid-two">
                  {EXPERIENCE_TYPES.map((experience) => (
                    <ChoiceCard
                      key={experience.id}
                      checked={form.experienceTypes.includes(experience.id)}
                      onChange={() => toggleExperienceType(experience.id)}
                      description={experience.description}
                    >
                      {experience.title}
                    </ChoiceCard>
                  ))}
                </div>
              </Field>

              {form.experienceTypes.length > 0 && (
                <div className="events-service-group">
                  <h3>Services to include</h3>
                  <p className="events-hint">Select any services you'd like. You can leave the guest quantity undecided.</p>
                  {SERVICE_GROUPS.map((group) => {
                    const relevantItems = group.items.filter((name) =>
                      form.experienceTypes.some((id) =>
                        EXPERIENCE_TYPES.find((experience) => experience.id === id)?.services.includes(name)
                      )
                    );
                    if (!relevantItems.length) return null;
                    return (
                      <div className="events-service-group" key={group.title}>
                        <h3>{group.title}</h3>
                        <div className="events-service-list">
                          {relevantItems.map((name) => {
                            const item = form.services[name] || { selected: false, quantity: "10" };
                            return (
                              <div className={`events-service-row ${item.selected ? "is-selected" : ""}`} key={name}>
                                <label className="events-check-label">
                                  <input type="checkbox" checked={item.selected} onChange={() => toggleService(name)} />
                                  <span>{name}</span>
                                </label>
                                {item.selected && (
                                  <label className="events-quantity">
                                    <span>Guests</span>
                                    <input
                                      type="number"
                                      min="1"
                                      max="500"
                                      value={item.quantity}
                                      onChange={(e) => update("services", {
                                        ...form.services,
                                        [name]: { ...item, quantity: e.target.value },
                                      })}
                                      aria-label={`Number of guests for ${name}`}
                                    />
                                    <button type="button" onClick={() => update("services", {
                                      ...form.services,
                                      [name]: { ...item, quantity: "" },
                                    })}>Undecided</button>
                                  </label>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {Array.from(new Set(form.experienceTypes.flatMap((id) =>
                    EXPERIENCE_TYPES.find((experience) => experience.id === id)?.extras || []
                  ))).length > 0 && (
                    <div className="events-service-group">
                      <h3>Additional experiences</h3>
                      <div className="events-choice-grid events-choice-grid-two">
                        {Array.from(new Set(form.experienceTypes.flatMap((id) =>
                          EXPERIENCE_TYPES.find((experience) => experience.id === id)?.extras || []
                        ))).map((name) => (
                          <ChoiceCard key={name} checked={form.experienceAddons.includes(name)} onChange={() => toggleExperienceAddon(name)}>
                            {name}
                          </ChoiceCard>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Field label="Anything else you'd like us to know?" hint="Optional. Describe your vision, atmosphere, theme or any special touches you'd like us to consider.">
                <TextArea rows={5} value={form.experienceDescription} onChange={(e) => update("experienceDescription", e.target.value)} placeholder="Tell us about the experience you'd love us to create…" />
              </Field>
            </div>
          )}

          {stage === 2 && (
            <div className="events-stage">
              <p className="events-step">03 / SCHEDULING & LOGISTICS</p>
              <h2>Let's understand the setup</h2>
              <p className="events-intro">We'll plan the treatment schedule and therapist arrangements around your event.</p>

              <div className="events-two-columns">
                <Field label="Event start time">
                  <TextInput type="time" value={form.startTime} onChange={(e) => update("startTime", e.target.value)} />
                </Field>
                <Field label="Event finish time">
                  <TextInput type="time" value={form.endTime} onChange={(e) => update("endTime", e.target.value)} />
                </Field>
              </div>
              <p className="events-hint">Leave these blank if the timing is still flexible. We only need the overall event window; Beauty Call will plan individual treatment slots.</p>

              <Field label="What treatment space will be available?">
                <div className="events-choice-grid">
                  {[
                    "Dedicated treatment room",
                    "Shared or open space",
                    "No treatment space arranged yet",
                    "Not sure — Beauty Call can advise",
                  ].map((choice) => (
                    <ChoiceCard key={choice} checked={form.treatmentSpace === choice} onChange={() => update("treatmentSpace", choice)}>
                      {choice}
                    </ChoiceCard>
                  ))}
                </div>
              </Field>

              <Field label="Venue access and setup" hint="Tell us about gate codes, security, loading access, setup times, stairs or other access arrangements.">
                <TextArea rows={4} value={form.accessDetails} onChange={(e) => update("accessDetails", e.target.value)} placeholder="Access and setup information…" />
              </Field>
              <Field label="Parking arrangements">
                <TextArea rows={3} value={form.parkingDetails} onChange={(e) => update("parkingDetails", e.target.value)} placeholder="Parking availability, restrictions or permits…" />
              </Field>
              <Field label="Facilities or setup details" hint="For example, available beds or furniture, electricity, water or venue restrictions.">
                <TextArea rows={3} value={form.setupDetails} onChange={(e) => update("setupDetails", e.target.value)} placeholder="Anything about the venue setup we should know…" />
              </Field>
            </div>
          )}

          {stage === 3 && (
            <div className="events-stage">
              <p className="events-step">04 / REQUIREMENTS & BUDGET</p>
              <h2>Anything else we should consider?</h2>
              <p className="events-intro">These details help us shape a practical proposal for your guests and venue.</p>

              <Field label="Special guest requirements" hint="For example, accessibility needs, age considerations or particular treatment preferences.">
                <TextArea rows={4} value={form.specialRequirements} onChange={(e) => update("specialRequirements", e.target.value)} placeholder="Share any special requirements…" />
              </Field>

              <Field label="Do you have a budget in mind?">
                <div className="events-choice-grid events-choice-grid-two">
                  <ChoiceCard checked={form.budgetChoice === "quote"} onChange={() => update("budgetChoice", "quote")}>I'd prefer to receive a quotation first</ChoiceCard>
                  <ChoiceCard checked={form.budgetChoice === "amount"} onChange={() => update("budgetChoice", "amount")}>I have a budget in mind</ChoiceCard>
                </div>
                {form.budgetChoice === "amount" && (
                  <TextInput type="number" min="0" value={form.budgetAmount} onChange={(e) => update("budgetAmount", e.target.value)} placeholder="Budget amount in rand (R)" />
                )}
              </Field>

              <Field label="Additional comments">
                <TextArea rows={4} value={form.additionalComments} onChange={(e) => update("additionalComments", e.target.value)} placeholder="Anything else you'd like us to know…" />
              </Field>
            </div>
          )}

          {stage === 4 && (
            <div className="events-stage">
              <p className="events-step">05 / CONTACT DETAILS</p>
              <h2>Where can we reach you?</h2>
              <p className="events-intro">We'll use these details to discuss your enquiry and prepare your quotation.</p>

              <Field label="Organiser's full name">
                <TextInput autoComplete="name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Full name" />
              </Field>
              <Field label="Phone number">
                <TextInput type="tel" autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+27…" />
              </Field>
              <Field label="Email address">
                <TextInput type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" />
              </Field>

              <Field label="How would you like Beauty Call to contact you?">
                <div className="events-choice-grid events-choice-grid-two">
                  <ChoiceCard checked={form.contactChannel === "whatsapp"} onChange={() => update("contactChannel", "whatsapp")}>WhatsApp</ChoiceCard>
                  <ChoiceCard checked={form.contactChannel === "email"} onChange={() => update("contactChannel", "email")}>Email</ChoiceCard>
                </div>
              </Field>

              <div className="events-review">
                <h3>Enquiry overview</h3>
                <p><strong>Attendance:</strong> {form.attendance || "Not specified"}</p>
                <p><strong>Venue:</strong> {[form.venueName, form.venueAddress].filter(Boolean).join(" · ") || "Not specified"}</p>
                <p><strong>Event:</strong> {form.eventType === "Other" ? form.otherEventType : form.eventType || "Not selected"}</p>
                <p><strong>Experience:</strong> {form.experienceTypes.map((id) => EXPERIENCE_TYPES.find((item) => item.id === id)?.title).filter(Boolean).join(", ") || "Not specified"}</p>
                <p><strong>Services:</strong> {selectedServiceCount} selected</p>
                <p><strong>Contact:</strong> {form.contactChannel === "whatsapp" ? "WhatsApp" : "Email"}</p>
              </div>
              <p className="events-hint">You'll be able to review the complete enquiry before it is sent. We will also save it to Beauty Call's enquiry records when the secure submission connection is added.</p>
              {submitError && <p className="events-error" role="alert">{submitError}</p>}
            </div>
          )}

          <div className="events-navigation">
            <button type="button" className="events-back" onClick={back} disabled={stage === 0 && !onBack}>Back</button>
            {stage < STAGES.length - 1 ? (
              <button type="button" className="events-next" onClick={next} disabled={!canContinue()}>Continue</button>
            ) : (
              <button type="submit" className="events-next" disabled={!canContinue()}>Submit event enquiry</button>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
