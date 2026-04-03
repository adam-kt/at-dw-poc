"use client";

import { useState } from "react";
import type {
  ElectionLookupResponse,
  DWElection,
  DWQuestionAnswer,
} from "./types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function HtmlContent({ html }: { html: string }) {
  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function QAItem({ qa, overrideAnswer }: { qa: DWQuestionAnswer; overrideAnswer?: string }) {
  if (!qa.question) return null;
  return (
    <details className="border-b border-zinc-100 py-3 last:border-0 dark:border-zinc-800">
      <summary className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-50">
        {qa.question}
      </summary>
      <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
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
    <div className="flex justify-between py-1">
      <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      <span className="font-medium text-zinc-900 dark:text-zinc-50">
        {date}{time ? ` at ${time}` : ""}
      </span>
    </div>
  );
}

function VotingSection({ election }: { election: DWElection }) {
  const { voting } = election;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {voting.inPersonVotingAvailable && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
            In-Person Voting Available
          </span>
        )}
        {voting.mailBallotsSentAutomatically && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Mail Ballots Sent Automatically
          </span>
        )}
      </div>

      {/* Early Voting */}
      {voting.early.startDate && (
        <div>
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Early Voting</h4>
          <div className="mt-1 text-sm">
            <DeadlineRow label="Start" date={voting.early.startDate} />
            <DeadlineRow label="End" date={voting.early.endDate} />
            {voting.early.url && (
              <a href={voting.early.url} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 underline text-xs dark:text-blue-400">Find early voting locations</a>
            )}
          </div>
        </div>
      )}

      {/* Vote by Mail */}
      <div>
        <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Vote by Mail</h4>
        <div className="mt-1 text-sm">
          <DeadlineRow label="Return in person by" date={voting.byMail.deadline.returnInPerson.date} time={voting.byMail.deadline.returnInPerson.timestamp} />
          <DeadlineRow label="Return by mail by" date={voting.byMail.deadline.returnByMail.date} time={voting.byMail.deadline.returnByMail.timestamp} />
          <DeadlineRow label="Ballot request by" date={voting.byMail.deadline.ballotRequest.date} />
          {voting.byMail.deadline.postmarkedOrReceived && (
            <div className="flex justify-between py-1">
              <span className="text-zinc-600 dark:text-zinc-400">Must be</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50 capitalize">{voting.byMail.deadline.postmarkedOrReceived}</span>
            </div>
          )}
        </div>
      </div>

      {/* In Person */}
      {voting.inPerson.idInstructions && (
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold text-zinc-700 dark:text-zinc-300">
            In-Person ID Requirements
          </summary>
          <div className="mt-2 text-zinc-600 dark:text-zinc-400">
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
    <div className="space-y-2 text-sm">
      <DeadlineRow label="In-person deadline" date={registration.inPerson.deadline.date} />
      {registration.inPerson.atPollingPlaceOnElectionDay && (
        <p className="text-green-700 dark:text-green-400 text-xs font-medium">Same-day registration at polling place available</p>
      )}
      <DeadlineRow label="Online deadline" date={registration.online.deadline.date} />
      {registration.online.url && (
        <a href={registration.online.url} target="_blank" rel="noopener noreferrer"
          className="text-blue-600 underline text-xs dark:text-blue-400">Register online</a>
      )}
      <DeadlineRow label="By mail deadline" date={registration.byMail.deadline.date} />
      {registration.byMail.deadline.postmarkedOrReceived && (
        <p className="text-xs text-zinc-500">Must be {registration.byMail.deadline.postmarkedOrReceived}</p>
      )}
    </div>
  );
}

function BallotMeasuresSection({ measures }: { measures: DWElection["ballotMeasures"] }) {
  if (!measures || measures.length === 0) return <p className="text-zinc-500 text-sm">No ballot measures for this election.</p>;
  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {measures.map((m) => (
        <details key={m.id} className="py-3 first:pt-0 last:pb-0">
          <summary className="cursor-pointer">
            <span className="font-medium text-zinc-900 dark:text-zinc-50">
              {m.streamlinedName || m.id}
            </span>
            {m.type && (
              <span className="ml-2 rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {m.type}
              </span>
            )}
            {m.status && (
              <span className="ml-2 rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {m.status}
              </span>
            )}
          </summary>
          <div className="mt-2 space-y-2 pl-4 text-sm text-zinc-600 dark:text-zinc-400">
            {m.topicAreas?.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {m.topicAreas.map((t) => (
                  <span key={t} className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {m.summary && (
              <div>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Summary: </span>
                <HtmlContent html={m.summary} />
              </div>
            )}
            {m.yesVote && (
              <div>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">A &quot;Yes&quot; vote means: </span>
                <HtmlContent html={m.yesVote} />
              </div>
            )}
            {m.ballotQuestion && (
              <details className="mt-1">
                <summary className="cursor-pointer text-xs font-medium text-zinc-500">Full ballot question</summary>
                <div className="mt-1"><HtmlContent html={m.ballotQuestion} /></div>
              </details>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

function ContestsSection({ contests }: { contests: DWElection["contests"] }) {
  if (!contests || contests.length === 0) return <p className="text-zinc-500 text-sm">No contests for this election.</p>;
  return (
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {contests.map((c) => (
        <div key={c.id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-zinc-900 dark:text-zinc-50">{c.name}</span>
            {c.branch && (
              <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 capitalize dark:bg-zinc-800 dark:text-zinc-400">
                {c.branch}
              </span>
            )}
          </div>
          {c.candidates.length > 0 && (
            <ul className="mt-2 space-y-1 pl-4">
              {c.candidates.map((cand) => (
                <li key={cand.id} className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-900 dark:text-zinc-50">{cand.fullName}</span>
                  {cand.partyAffiliation?.length > 0 && (
                    <span className="text-xs text-zinc-500">({cand.partyAffiliation.join(", ")})</span>
                  )}
                  {cand.contact?.campaign?.website && (
                    <a href={cand.contact.campaign.website} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 underline text-xs dark:text-blue-400">website</a>
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {election.description}
        </h3>
        <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 capitalize dark:bg-zinc-800 dark:text-zinc-400">
          {election.type}
        </span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Date: <span className="font-medium text-zinc-900 dark:text-zinc-50">{election.date}</span>
        {election.pollingLocationUrl && (
          <> &middot; <a href={election.pollingLocationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline dark:text-blue-400">Find polling location</a></>
        )}
        {election.website && (
          <> &middot; <a href={election.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline dark:text-blue-400">Election website</a></>
        )}
      </p>

      {/* Voting */}
      <Section title="Voting">
        <VotingSection election={election} />
      </Section>

      {/* Registration */}
      <Section title="Registration">
        <RegistrationSection election={election} />
      </Section>

      {/* Ballot Measures */}
      <Section title="What's on the Ballot — Measures">
        <BallotMeasuresSection measures={election.ballotMeasures} />
      </Section>

      {/* Contests */}
      <Section title="What's on the Ballot — Contests">
        <ContestsSection contests={election.contests} />
      </Section>

      {/* Q&A */}
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
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col gap-8 py-16 px-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Election Lookup
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Enter your zipcode to find upcoming elections, ballot measures, contests, and voting info.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            placeholder="e.g. 80202"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
            className="w-40 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="submit"
            disabled={loading || zipcode.length !== 5}
            className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Looking up..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-8">
            {/* Resolved Address */}
            <Section title="Location">
              <p className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {result.address.city}, {result.address.state} {result.address.zipcode}
              </p>
              {result.address.street && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  Resolved address: {result.address.street}
                </p>
              )}
            </Section>

            {/* Elections */}
            {result.elections.length === 0 ? (
              <Section title="Elections">
                <p className="text-zinc-500">No upcoming elections found for this location.</p>
              </Section>
            ) : (
              result.elections.map((election, i) => (
                <div key={i} className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-950">
                  <ElectionCard election={election} />
                </div>
              ))
            )}

            {/* State Authority */}
            {result.authority && (
              <Section title="State Election Authority">
                <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
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
                    <a href={result.authority.homepageUrl} target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 underline dark:text-blue-400">Official Website</a>
                  )}
                </div>
              </Section>
            )}

            {/* Raw JSON (debug) */}
            <details className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Raw API Response
              </summary>
              <pre className="mt-3 overflow-x-auto text-xs text-zinc-600 dark:text-zinc-400">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </main>
    </div>
  );
}
