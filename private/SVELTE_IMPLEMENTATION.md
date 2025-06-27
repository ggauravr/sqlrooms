# SQLRooms Svelte Implementation Guide

This document outlines how to implement a Svelte version of SQLRooms within the existing React codebase, allowing for easy cross-referencing and parallel development.

## 📁 Codebase Organization

The Svelte implementation coexists with the React version using the following structure:

```
sqlrooms/
├── packages/
│   ├── # 🔵 EXISTING REACT PACKAGES (unchanged)
│   ├── room-shell/                 # React room shell
│   ├── ui/                         # React UI components  
│   ├── room-store/                 # React/Zustand store
│   ├── sql-editor/                 # React SQL editor
│   ├── ai/                         # React AI integration
│   ├── data-table/                 # React data tables
│   ├── # 🟢 SHARED PACKAGES (reused by both)
│   ├── duckdb/                     # ✅ Framework-agnostic
│   ├── room-config/                # ✅ Framework-agnostic
│   ├── utils/                      # ✅ Framework-agnostic
│   ├── *-config/                   # ✅ Framework-agnostic
│   ├── # 🟡 NEW SVELTE PACKAGES
│   ├── svelte-room-shell/          # 🆕 Svelte room shell
│   ├── svelte-ui/                  # 🆕 Svelte UI components
│   ├── svelte-room-store/          # 🆕 Svelte store management
│   ├── svelte-sql-editor/          # 🆕 Svelte SQL editor
│   ├── svelte-ai/                  # 🆕 Svelte AI integration
│   └── svelte-data-table/          # 🆕 Svelte data tables
├── examples/
│   ├── # 🔵 EXISTING REACT EXAMPLES (unchanged)
│   ├── minimal/                    # React minimal example
│   ├── ai/                         # React AI example
│   ├── query/                      # React query example
│   ├── # 🟡 NEW SVELTE EXAMPLES
│   ├── svelte-minimal/             # 🆕 Svelte minimal example
│   ├── svelte-ai/                  # 🆕 Svelte AI example
│   └── svelte-query/               # 🆕 Svelte query example
└── docs/                           # Updated to cover both
```

## 🚀 Getting Started

### 1. Install Dependencies

First, install Svelte dependencies at the root level:

```bash
# Navigate to the project root
cd sqlrooms

# Install Svelte as a workspace dependency
pnpm add -D svelte@^5.0.0 @sveltejs/vite-plugin-svelte@^4.0.0 svelte-check@^4.0.0

# Install dependencies for the new packages
pnpm install
```

### 2. Build the Svelte Packages

```bash
# Build the new Svelte packages
pnpm build --filter=@sqlrooms/svelte-*
```

### 3. Run the Svelte Examples

```bash
# Run the minimal Svelte example
cd examples/svelte-minimal
pnpm dev

# The example will be available at http://localhost:5173
```

## 🏗️ Implementation Strategy

### Phase 1: Core Store Management
- ✅ `packages/svelte-room-store/` - Svelte store equivalent of Zustand
- ✅ `packages/svelte-room-shell/` - Basic shell component

### Phase 2: UI Components  
- 🔄 `packages/svelte-ui/` - Port React components to Svelte
- 🔄 `packages/svelte-data-table/` - Svelte data tables

### Phase 3: Feature Packages
- 🔄 `packages/svelte-sql-editor/` - Monaco editor integration
- 🔄 `packages/svelte-ai/` - AI-powered analytics
- 🔄 `packages/svelte-layout/` - Panel layout system

### Phase 4: Advanced Features
- 🔄 `packages/svelte-vega/` - Vega chart integration
- 🔄 `packages/svelte-cosmos/` - Graph visualization

## 🔄 Cross-Reference Workflow

When implementing Svelte components, you can easily reference the React versions:

```bash
# Compare React and Svelte implementations side by side
ls -la packages/room-shell/src/     # React version
ls -la packages/svelte-room-shell/src/  # Svelte version

# Example: Converting a React component to Svelte
code packages/ui/src/components/Button.tsx           # React Button
code packages/svelte-ui/src/Button.svelte          # Svelte Button
```

## 📦 Package Structure Template

Each Svelte package follows this structure:

```
packages/svelte-{package-name}/
├── package.json          # Dependencies and build config
├── tsconfig.json         # TypeScript configuration
├── src/
│   ├── index.ts         # Main exports
│   ├── {Component}.svelte # Svelte components  
│   └── lib/             # Utility functions
├── dist/                # Build output
└── README.md            # Package documentation
```

## 🔧 Development Commands

```bash
# Build all packages (React + Svelte)
pnpm build

# Build only Svelte packages
pnpm build --filter=@sqlrooms/svelte-*

# Build only React packages (existing)
pnpm build --filter=@sqlrooms/* --filter=!@sqlrooms/svelte-*

# Run all examples
pnpm dev

# Run only React examples
pnpm dev --filter=./examples/* --filter=!./examples/svelte-*

# Run only Svelte examples  
pnpm dev --filter=./examples/svelte-*
```

## 🎯 Key Architectural Decisions

### State Management
- **React**: Uses Zustand with slice pattern
- **Svelte**: Uses native Svelte stores with similar slice pattern
- **Shared**: Configuration schemas and types

### UI Components
- **React**: Based on shadcn/ui + Tailwind
- **Svelte**: Based on shadcn-svelte + same Tailwind preset
- **Shared**: Same design system and styling

### Data Layer
- **Both**: Share the same DuckDB integration and utilities
- **Both**: Same Arrow table handling and SQL query patterns

## 🔍 Example Conversion Process

Here's how to convert a React component to Svelte:

### React Component (packages/ui/src/Button.tsx)
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', size = 'md', children, onClick }: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Svelte Component (packages/svelte-ui/src/Button.svelte)
```svelte
<script lang="ts">
  export let variant: 'primary' | 'secondary' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
</script>

<button 
  class="btn btn-{variant} btn-{size}"
  on:click
>
  <slot />
</button>
```

## 🧪 Testing Strategy

Both React and Svelte packages can be tested independently:

```bash
# Test React packages
pnpm test --filter=@sqlrooms/* --filter=!@sqlrooms/svelte-*

# Test Svelte packages  
pnpm test --filter=@sqlrooms/svelte-*

# Test everything
pnpm test
```

## 📚 Benefits of This Approach

1. **Easy Cross-Reference**: React and Svelte code side by side
2. **Shared Logic**: Reuse framework-agnostic packages
3. **Independent Development**: Both versions can evolve separately
4. **Consistent Architecture**: Same modular slice-based approach
5. **No Disruption**: Existing React functionality remains unchanged
6. **Gradual Migration**: Teams can migrate incrementally

## 🎛️ Build System Integration

The existing build system automatically handles both React and Svelte packages:

- **Turbo**: Builds all packages in parallel
- **TypeScript**: Shared TypeScript configuration
- **Linting**: Same ESLint rules for both
- **Testing**: Same Jest configuration

## 🚀 Next Steps

1. **Complete Core Packages**: Finish svelte-room-store and svelte-room-shell
2. **Build UI Library**: Port essential UI components
3. **Create Examples**: Build functional Svelte examples
4. **Add Documentation**: Update docs to cover both frameworks
5. **Testing**: Add comprehensive test coverage
6. **Performance**: Optimize for production use

This structure allows you to build the Svelte version while maintaining full access to the React codebase for reference and comparison! 