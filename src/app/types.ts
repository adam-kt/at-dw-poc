// Mapbox Geocoding API response (relevant fields)
export interface MapboxFeature {
  place_name: string;
  center: [number, number]; // [lng, lat]
  context: {
    id: string;
    text: string;
    short_code?: string;
  }[];
}

export interface MapboxGeocodingResponse {
  features: MapboxFeature[];
}

// --- Democracy Works API v2 types ---

// Voting
export interface DWDeadline {
  date: string | null;
  timestamp: string | null;
  description: string | null;
  postmarkedOrReceived?: string | null;
}

export interface DWVoting {
  inPersonVotingAvailable: boolean;
  mailBallotsSentAutomatically: boolean;
  early: {
    url: string | null;
    startDate: string | null;
    endDate: string | null;
    varies: boolean | null;
  };
  byMail: {
    idInstructions: string | null;
    explainerUrl: string | null;
    allMail: {
      ballotInfoUrl: string | null;
      ballotSendStartDate: string | null;
      ballotSendEndDate: string | null;
      ballotReceiveExpectedStartDate: string | null;
      ballotReceiveExpectedEndDate: string | null;
    };
    deadline: {
      postmarkedOrReceived: string | null;
      receivedNoLaterThan: DWDeadline;
      returnInPerson: DWDeadline;
      returnByMail: DWDeadline;
      ballotRequest: DWDeadline;
    };
  };
  inPerson: {
    idRequiredAllVoters: boolean | null;
    idInstructions: string | null;
    electionDay: {
      closing: {
        timestamp: string | null;
        description: string | null;
      };
    };
  };
}

// Registration
export interface DWRegistration {
  explainerUrl: string | null;
  inPerson: {
    atPollingPlaceOnElectionDay: boolean;
    deadline: DWDeadline;
  };
  online: {
    url: string | null;
    instructions: string | null;
    deadline: DWDeadline;
  };
  byMail: {
    idInstructions: string | null;
    signatureInstructions: string | null;
    newVoterInstructions: string | null;
    deadline: DWDeadline;
  };
}

// Question & Answer
export interface DWQuestionAnswer {
  question: string | null;
  answer: string | null;
}

export interface DWQuestionAndAnswer {
  keyChanges?: DWQuestionAnswer;
  whoCanVote?: DWQuestionAnswer;
  byMailRegistration?: DWQuestionAnswer;
  electionDayRegistration?: DWQuestionAnswer;
  inPersonRegistration?: DWQuestionAnswer;
  checkRegistration?: DWQuestionAnswer;
  contactElectionOffice?: DWQuestionAnswer;
  localContactInfo?: DWQuestionAnswer;
  stateContactInfo?: DWQuestionAnswer;
  voteInPerson?: DWQuestionAnswer;
  voteByMail?: DWQuestionAnswer;
  whatsOnTheBallot?: DWQuestionAnswer;
  militaryAndOverseas?: DWQuestionAnswer;
  aboutInfo?: DWQuestionAnswer;
  [key: string]: DWQuestionAnswer | undefined;
}

// Ballot Measures
export interface DWBallotMeasure {
  id: string;
  streamlinedName: string | null;
  type: string | null;
  topicAreas: string[];
  summary: string | null;
  yesVote: string | null;
  ballotQuestion: string | null;
  status: string | null;
}

// Candidates
export interface DWCandidate {
  id: string;
  fullName: string;
  partyAffiliation: string[];
  contact?: {
    campaign?: {
      website?: string | null;
    };
  };
}

// Contests
export interface DWContest {
  id: string;
  name: string;
  branch: string | null;
  candidates: DWCandidate[];
}

// Election (top-level)
export interface DWElection {
  description: string;
  type: string;
  date: string;
  pollingLocationUrl: string | null;
  website: string | null;
  voting: DWVoting;
  registration: DWRegistration;
  questionAndAnswer?: DWQuestionAndAnswer;
  ballotMeasures?: DWBallotMeasure[];
  contests?: DWContest[];
  [key: string]: unknown;
}

// Authority
export interface DWAuthority {
  officeName: string;
  officialTitle: string;
  homepageUrl: string | null;
  contact: {
    phone: string | null;
    email: string | null;
    physicalAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
    } | null;
  };
  questionAndAnswer?: DWQuestionAndAnswer;
  [key: string]: unknown;
}

// Internal API types
export interface ElectionLookupResponse {
  address: {
    city: string;
    state: string;
    stateCode: string;
    zipcode: string;
    street: string;
  };
  elections: DWElection[];
  authority: DWAuthority | null;
  error?: string;
}
