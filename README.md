# StackPolls

A decentralized polling application built on Stacks Bitcoin L2, using Clarity 4 smart contracts.

## Features

- Create polls with multiple options
- Vote on polls (one vote per address)
- Time-based poll expiration using `stacks-block-time` (Clarity 4)
- View poll results in real-time
- Network switching (Testnet/Mainnet)
- Leather wallet integration

## Tech Stack

- **Smart Contract:** Clarity 4 (epoch 3.3)
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Blockchain:** Stacks Bitcoin L2
- **Wallet:** Leather (via @stacks/connect)

## Project Structure

```
stackpolls/
├── contracts/              # Clarity smart contracts
│   ├── contracts/
│   │   └── poll.clar       # Main polling contract
│   ├── deployments/        # Deployment plans
│   ├── settings/           # Network configurations
│   └── Clarinet.toml       # Clarinet project config
└── frontend/               # React frontend
    ├── client/
    │   └── src/
    │       ├── components/ # UI components
    │       ├── context/    # React context (Stacks provider)
    │       ├── hooks/      # Custom hooks for contract interaction
    │       ├── lib/        # Utilities and Stacks config
    │       └── pages/      # Page components
    └── server/             # Express server
```

## Smart Contract

The `poll.clar` contract uses Clarity 4 features:

- **`stacks-block-time`** - Unix timestamp for poll deadlines and vote tracking

### Contract Functions

| Function | Type | Description |
|----------|------|-------------|
| `create-poll` | Public | Create a new poll with title, options, and duration |
| `vote` | Public | Cast a vote on a poll |
| `close-poll` | Public | Close a poll early (creator only) |
| `get-poll` | Read-only | Get poll details |
| `get-poll-option` | Read-only | Get option details and vote count |
| `has-voted` | Read-only | Check if an address has voted |
| `get-poll-count` | Read-only | Get total number of polls |
| `is-poll-active` | Read-only | Check if poll is still active |
| `get-time-remaining` | Read-only | Get seconds until deadline |

## Deployed Contract

- **Testnet:** `STY7DZYAXNQDG7KYM6CTZV2HS4KRNEFTAM3ZZYQT.poll`

## Getting Started

### Prerequisites

- Node.js 18+
- [Clarinet](https://github.com/hirosystems/clarinet) (for contract development)
- [Leather Wallet](https://leather.io/) browser extension

### Contract Development

```bash
cd contracts

# Check contract syntax
clarinet check

# Run tests
clarinet test

# Deploy to testnet
clarinet deployments generate --testnet
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your contract address

# Start development server
npm run dev
```

### Environment Variables

```bash
# frontend/.env
VITE_POLL_CONTRACT_ADDRESS_TESTNET=STY7DZYAXNQDG7KYM6CTZV2HS4KRNEFTAM3ZZYQT
VITE_POLL_CONTRACT_ADDRESS_MAINNET=
VITE_DEFAULT_NETWORK=testnet
```

## Usage

1. Connect your Leather wallet
2. Switch to Testnet network
3. **Creator:** Create polls with title, options, and duration
4. **Participant:** Browse and vote on active polls
5. View results after voting or when poll closes

## Resources

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity 4 Features](https://docs.stacks.co/whats-new/clarity-4-is-now-live)
- [Hiro Clarinet Docs](https://docs.hiro.so/clarinet)
- [Stacks.js Reference](https://stacks.js.org/)

## License

MIT
