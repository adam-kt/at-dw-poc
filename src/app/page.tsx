"use client";

import { useState } from "react";
import type {
  ElectionLookupResponse,
  DWElection,
  DWQuestionAnswer,
} from "./types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <h2 className="section-title">{title}</h2>
      <div className="section-body">{children}</div>
    </section>
  );
}

function HtmlContent({ html }: { html: string }) {
  return (
    <div className="rich-html" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

function QAItem({ qa, overrideAnswer }: { qa: DWQuestionAnswer; overrideAnswer?: string }) {
  if (!qa.question) return null;
  return (
    <details className="qa-item">
      <summary>{qa.question}</summary>
      <div className="qa-answer">
        {overrideAnswer ? (
          <p>{overrideAnswer}</p>
        ) : qa.answer ? (
          <HtmlContent html={qa.answer} />
        ) : null}
      </div>
    </details>
  );
}

function DeadlineRow({ label, date, time }: { label: string; date: string | null; time?: string | null }) {
  if (!date) return null;
  return (
    <div className="deadline-row">
      <span className="deadline-label">{label}</span>
      <span className="deadline-value">
        {date}{time ? ` at ${time}` : ""}
      </span>
    </div>
  );
}

function VotingSection({ election }: { election: DWElection }) {
  const { voting } = election;
  return (
    <div className="stack">
      <div className="pill-group">
        {voting.inPersonVotingAvailable && (
          <span className="pill pill-success">In-Person Voting Available</span>
        )}
        {voting.mailBallotsSentAutomatically && (
          <span className="pill pill-info">Mail Ballots Sent Automatically</span>
        )}
      </div>

      {voting.early.startDate && (
        <div>
          <h4 className="subheading">Early Voting</h4>
          <div className="small-text">
            <DeadlineRow label="Start" date={voting.early.startDate} />
            <DeadlineRow label="End" date={voting.early.endDate} />
            {voting.early.url && (
              <a href={voting.early.url} target="_blank" rel="noopener noreferrer" className="link-small">
                Find early voting locations
              </a>
            )}
          </div>
        </div>
      )}

      <div>
        <h4 className="subheading">Vote by Mail</h4>
        <div className="small-text">
          <DeadlineRow label="Return in person by" date={voting.byMail.deadline.returnInPerson.date} time={voting.byMail.deadline.returnInPerson.timestamp} />
          <DeadlineRow label="Return by mail by" date={voting.byMail.deadline.returnByMail.date} time={voting.byMail.deadline.returnByMail.timestamp} />
          <DeadlineRow label="Ballot request by" date={voting.byMail.deadline.ballotRequest.date} />
          {voting.byMail.deadline.postmarkedOrReceived && (
            <div className="deadline-row">
              <span className="deadline-label">Must be</span>
              <span className="deadline-value capitalize">{voting.byMail.deadline.postmarkedOrReceived}</span>
            </div>
          )}
        </div>
      </div>

      {voting.inPerson.idInstructions && (
        <details className="small-text">
          <summary className="subheading" style={{ cursor: "pointer" }}>
            In-Person ID Requirements
          </summary>
          <div className="qa-answer">
            <HtmlContent html={voting.inPerson.idInstructions} />
          </div>
        </details>
      )}
    </div>
  );
}

function RegistrationSection({ election }: { election: DWElection }) {
  const { registration } = election;
  return (
    <div className="stack-sm">
      <DeadlineRow label="In-person deadline" date={registration.inPerson.deadline.date} />
      {registration.inPerson.atPollingPlaceOnElectionDay && (
        <p className="same-day-notice">Same-day registration at polling place available</p>
      )}
      <DeadlineRow label="Online deadline" date={registration.online.deadline.date} />
      {registration.online.url && (
        <a href={registration.online.url} target="_blank" rel="noopener noreferrer" className="link-small">
          Register online
        </a>
      )}
      <DeadlineRow label="By mail deadline" date={registration.byMail.deadline.date} />
      {registration.byMail.deadline.postmarkedOrReceived && (
        <p className="subtle-text">Must be {registration.byMail.deadline.postmarkedOrReceived}</p>
      )}
    </div>
  );
}

function BallotMeasuresSection({ measures }: { measures: DWElection["ballotMeasures"] }) {
  if (!measures || measures.length === 0) return <p className="empty-text">No ballot measures for this election.</p>;
  return (
    <div className="divided-list">
      {measures.map((m) => (
        <details key={m.id} className="ballot-measure">
          <summary>
            <span className="ballot-measure-name">
              {m.streamlinedName || m.id}
            </span>
            {m.type && <span className="tag">{m.type}</span>}
            {m.status && <span className="tag">{m.status}</span>}
          </summary>
          <div className="ballot-measure-body">
            {m.topicAreas?.length > 0 && (
              <div className="topic-tags">
                {m.topicAreas.map((t) => (
                  <span key={t} className="pill pill-tag">{t}</span>
                ))}
              </div>
            )}
            {m.summary && (
              <div>
                <strong>Summary: </strong>
                <HtmlContent html={m.summary} />
              </div>
            )}
            {m.yesVote && (
              <div>
                <strong>A &quot;Yes&quot; vote means: </strong>
                <HtmlContent html={m.yesVote} />
              </div>
            )}
            {m.ballotQuestion && (
              <details>
                <summary className="subtle-text" style={{ cursor: "pointer", fontWeight: 500 }}>
                  Full ballot question
                </summary>
                <div style={{ marginTop: "0.25rem" }}>
                  <HtmlContent html={m.ballotQuestion} />
                </div>
              </details>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

function ContestsSection({ contests }: { contests: DWElection["contests"] }) {
  if (!contests || contests.length === 0) return <p className="empty-text">No contests for this election.</p>;
  return (
    <div className="divided-list">
      {contests.map((c) => (
        <div key={c.id} className="contest-row">
          <div className="contest-header">
            <span className="contest-name">{c.name}</span>
            {c.branch && <span className="tag">{c.branch}</span>}
          </div>
          {c.candidates.length > 0 && (
            <ul className="candidate-list">
              {c.candidates.map((cand) => (
                <li key={cand.id} className="candidate-row">
                  <span>{cand.fullName}</span>
                  {cand.partyAffiliation?.length > 0 && (
                    <span className="candidate-party">({cand.partyAffiliation.join(", ")})</span>
                  )}
                  {cand.contact?.campaign?.website && (
                    <a href={cand.contact.campaign.website} target="_blank" rel="noopener noreferrer" className="link-small">
                      website
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function ElectionCard({ election }: { election: DWElection }) {
  return (
    <div className="election-inner">
      <div className="election-header">
        <h3 className="election-title">{election.description}</h3>
        <span className="tag">{election.type}</span>
      </div>
      <p className="election-meta">
        Date: <strong>{election.date}</strong>
        {election.pollingLocationUrl && (
          <> &middot; <a href={election.pollingLocationUrl} target="_blank" rel="noopener noreferrer">Find polling location</a></>
        )}
        {election.website && (
          <> &middot; <a href={election.website} target="_blank" rel="noopener noreferrer">Election website</a></>
        )}
      </p>

      <Section title="Voting">
        <VotingSection election={election} />
      </Section>

      <Section title="Registration">
        <RegistrationSection election={election} />
      </Section>

      <Section title="What's on the Ballot — Measures">
        <BallotMeasuresSection measures={election.ballotMeasures} />
      </Section>

      <Section title="What's on the Ballot — Contests">
        <ContestsSection contests={election.contests} />
      </Section>

      {election.questionAndAnswer && (
        <Section title="Voter Q&A">
          {Object.entries(election.questionAndAnswer).map(([key, qa]) => {
            if (!qa || !qa.question) return null;
            const overrideAnswer = key === "whatsOnTheBallot"
              ? "See what's on the ballot in our \"What's on the Ballot\" section above."
              : undefined;
            return <QAItem key={key} qa={qa} overrideAnswer={overrideAnswer} />;
          })}
        </Section>
      )}
    </div>
  );
}

export default function Home() {
  const [zipcode, setZipcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ElectionLookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/elections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zipcode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setResult(data);
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <main className="main">
        <div>
          <h1 className="page-title">Election Lookup</h1>
          <p className="page-subtitle">
            Enter your zipcode to find upcoming elections, ballot measures, contests, and voting info.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            placeholder="e.g. 80202"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
            className="search-input"
          />
          <button
            type="submit"
            disabled={loading || zipcode.length !== 5}
            className="search-button"
          >
            {loading ? "Looking up..." : "Search"}
          </button>
        </form>

        {error && <div className="error-banner">{error}</div>}

        {result && (
          <div className="results">
            <Section title="Location">
              <p className="location-line">
                {result.address.city}, {result.address.state} {result.address.zipcode}
              </p>
              {result.address.street && (
                <p className="location-sub">
                  Resolved address: {result.address.street}
                </p>
              )}
            </Section>

            {result.elections.length === 0 ? (
              <Section title="Elections">
                <p className="empty-text">No upcoming elections found for this location.</p>
              </Section>
            ) : (
              result.elections.map((election, i) => (
                <div key={i} className="election-card">
                  <ElectionCard election={election} />
                </div>
              ))
            )}

            {result.authority && (
              <Section title="State Election Authority">
                <div className="authority-body">
                  <p className="authority-name">
                    {result.authority.officeName} — {result.authority.officialTitle}
                  </p>
                  {result.authority.contact?.phone && <p>Phone: {result.authority.contact.phone}</p>}
                  {result.authority.contact?.email && <p>Email: {result.authority.contact.email}</p>}
                  {result.authority.contact?.physicalAddress && (
                    <p>
                      {result.authority.contact.physicalAddress.street},{" "}
                      {result.authority.contact.physicalAddress.city},{" "}
                      {result.authority.contact.physicalAddress.state}{" "}
                      {result.authority.contact.physicalAddress.zip}
                    </p>
                  )}
                  {result.authority.homepageUrl && (
                    <a href={result.authority.homepageUrl} target="_blank" rel="noopener noreferrer">
                      Official Website
                    </a>
                  )}
                </div>
              </Section>
            )}

            <details className="section">
              <summary className="section-title" style={{ cursor: "pointer" }}>
                Raw API Response
              </summary>
              <pre className="raw-json">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </main>
    </div>
  );
}
