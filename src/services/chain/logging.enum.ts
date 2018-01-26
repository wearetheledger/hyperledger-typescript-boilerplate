export enum HlfErrors {
    'NO_ENROLLED_USER' = 'User not defined, or not enrolled. Or network is down',
    'BAD_TRANSACTION_PROPOSAL' = 'transaction proposal was bad',
    'TRANSACTION_TIMED_OUT' = 'The transaction has timed out: %s',
    'INVALID_TRANSACTION' = 'The transaction was invalid, code: %s',
    'FAILED_TO_SEND_TX' = 'Failed to send transaction and get notifications within the timeout period: %s',
    'FAILED_TO_SEND_PROPOSAL' = 'Failed to send Proposal or receive valid response. Response null or status is not 200. exiting...',
}

export enum HlfInfo {
    'CREATING_CLIENT' = 'Create a client and set the wallet location',
    'CHECK_USER_ENROLLED' = 'Checking if user is enrolled',
    'USER_ENROLLED' = 'User is enrolled, setting query URL in the network',
    'MAKE_QUERY' = 'Make query',
    'ASSIGNING_TRANSACTION_ID' = 'Assigning transaction_id: %s',
    'NO_PAYLOADS_RETURNED' = 'No payloads were returned from query',
    'PAYLOAD_RESULT_COUNT' = 'Query result count: %s',
    'SET_WALLET_PATH' = 'Set wallet path, and associate user %s with application',
    'WALLET_PATH' = 'WALLET PATH: %s',
    'WALLET' = 'WALLET: %s',
    'GOOD_TRANSACTION_PROPOSAL' = 'transaction proposal was good',
    'RESPONSE_IS' = 'Response is %s',
    'SUCCESFULLY_SENT_PROPOSAL' = 'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s"',
    'COMMITTED_ON_PEER' = 'The transaction has been committed on peer %s',
    'SUCCESSSFULLY_SENT_TO_ORDERER' = 'Successfully sent transaction to the orderer.',
    'EVENT_PROMISES_COMPLETE' = 'Event promise all complete and testing complete',
}