;; StackPolls - Decentralized Polling Contract
;; Uses Clarity 4 functions: stacks-block-time, to-ascii?

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_POLL_NOT_FOUND (err u101))
(define-constant ERR_POLL_CLOSED (err u102))
(define-constant ERR_ALREADY_VOTED (err u103))
(define-constant ERR_INVALID_OPTION (err u104))
(define-constant ERR_INVALID_TITLE (err u105))
(define-constant ERR_INVALID_DEADLINE (err u106))
(define-constant ERR_NO_OPTIONS (err u107))

;; Data Variables
(define-data-var poll-counter uint u0)

;; Maps
(define-map polls uint {
  creator: principal,
  title: (string-ascii 100),
  option-count: uint,
  deadline: uint,
  is-closed: bool,
  total-votes: uint,
  created-at: uint
})

(define-map poll-options { poll-id: uint, option-index: uint } {
  text: (string-ascii 50),
  vote-count: uint
})

(define-map voter-records { poll-id: uint, voter: principal } {
  option-index: uint,
  voted-at: uint
})

;; Private Functions

;; Store options recursively using fold
(define-private (store-option (option (string-ascii 50)) (state { poll-id: uint, index: uint }))
  (begin
    (map-set poll-options
      { poll-id: (get poll-id state), option-index: (get index state) }
      { text: option, vote-count: u0 }
    )
    { poll-id: (get poll-id state), index: (+ (get index state) u1) }
  )
)

;; Update option vote count
(define-private (increment-option-votes (poll-id uint) (option-index uint))
  (let ((option-data (unwrap! (map-get? poll-options { poll-id: poll-id, option-index: option-index }) false)))
    (map-set poll-options
      { poll-id: poll-id, option-index: option-index }
      (merge option-data { vote-count: (+ (get vote-count option-data) u1) })
    )
    true
  )
)

;; Public Functions

;; Create poll - uses stacks-block-time (Clarity 4)
(define-public (create-poll
  (title (string-ascii 100))
  (options (list 10 (string-ascii 50)))
  (duration-seconds uint))
  (let (
    (poll-id (+ (var-get poll-counter) u1))
    (current-time (stacks-block-time))
    (deadline (+ current-time duration-seconds))
    (option-count (len options))
  )
    ;; Validations
    (asserts! (> (len title) u0) ERR_INVALID_TITLE)
    (asserts! (> duration-seconds u0) ERR_INVALID_DEADLINE)
    (asserts! (>= option-count u2) ERR_NO_OPTIONS)

    ;; Store poll metadata
    (map-set polls poll-id {
      creator: tx-sender,
      title: title,
      option-count: option-count,
      deadline: deadline,
      is-closed: false,
      total-votes: u0,
      created-at: current-time
    })

    ;; Store each option using fold
    (fold store-option options { poll-id: poll-id, index: u0 })

    ;; Update counter
    (var-set poll-counter poll-id)
    (ok poll-id)
  )
)

;; Vote - uses stacks-block-time for deadline check
(define-public (vote (poll-id uint) (option-index uint))
  (let ((poll (unwrap! (map-get? polls poll-id) ERR_POLL_NOT_FOUND)))
    ;; Validations
    (asserts! (not (get is-closed poll)) ERR_POLL_CLOSED)
    (asserts! (< (stacks-block-time) (get deadline poll)) ERR_POLL_CLOSED)
    (asserts! (< option-index (get option-count poll)) ERR_INVALID_OPTION)
    (asserts! (is-none (map-get? voter-records { poll-id: poll-id, voter: tx-sender })) ERR_ALREADY_VOTED)

    ;; Record vote
    (map-set voter-records { poll-id: poll-id, voter: tx-sender } {
      option-index: option-index,
      voted-at: (stacks-block-time)
    })

    ;; Update option vote count
    (unwrap! (increment-option-votes poll-id option-index) ERR_INVALID_OPTION)

    ;; Update poll total votes
    (map-set polls poll-id (merge poll { total-votes: (+ (get total-votes poll) u1) }))
    (ok true)
  )
)

;; Close poll (creator only)
(define-public (close-poll (poll-id uint))
  (let ((poll (unwrap! (map-get? polls poll-id) ERR_POLL_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get creator poll)) ERR_NOT_AUTHORIZED)
    (map-set polls poll-id (merge poll { is-closed: true }))
    (ok true)
  )
)

;; Read-only Functions

;; Get poll details
(define-read-only (get-poll (poll-id uint))
  (map-get? polls poll-id)
)

;; Get poll option
(define-read-only (get-poll-option (poll-id uint) (option-index uint))
  (map-get? poll-options { poll-id: poll-id, option-index: option-index })
)

;; Get current block time (Clarity 4)
(define-read-only (get-current-time)
  (stacks-block-time)
)

;; Check if address has voted
(define-read-only (has-voted (poll-id uint) (voter principal))
  (is-some (map-get? voter-records { poll-id: poll-id, voter: voter }))
)

;; Get voter's choice
(define-read-only (get-vote (poll-id uint) (voter principal))
  (map-get? voter-records { poll-id: poll-id, voter: voter })
)

;; Get total poll count
(define-read-only (get-poll-count)
  (var-get poll-counter)
)

;; Check if poll is expired
(define-read-only (is-poll-expired (poll-id uint))
  (match (map-get? polls poll-id)
    poll (>= (stacks-block-time) (get deadline poll))
    false
  )
)

;; Check if poll is active (not closed and not expired)
(define-read-only (is-poll-active (poll-id uint))
  (match (map-get? polls poll-id)
    poll (and
      (not (get is-closed poll))
      (< (stacks-block-time) (get deadline poll))
    )
    false
  )
)

;; Get poll status as ASCII string (demonstrates to-ascii?)
(define-read-only (get-poll-status (poll-id uint))
  (match (map-get? polls poll-id)
    poll (if (get is-closed poll)
      (ok "closed")
      (if (>= (stacks-block-time) (get deadline poll))
        (ok "expired")
        (ok "active")
      )
    )
    (err ERR_POLL_NOT_FOUND)
  )
)
