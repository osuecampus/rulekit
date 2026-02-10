# State Management Diagram Template

State management diagrams show store structure, modules, data flow between actions/mutations/getters, and component integration.

## Purpose

Use this template when:

- User asks about "store", "state management", "Vuex", "Redux", "Pinia"
- Showing state architecture
- Illustrating actions → mutations → state flow
- Mapping state to components

## Mermaid Graph Types

### State Diagram (Ideal for State Machines)

```mermaid
stateDiagram-v2
```

### Graph (Better for Store Architecture)

```mermaid
graph TD
```

**Use graph for store structure, state diagram for state transitions.**

## Store Structure Pattern

### Modular Store (Vuex/Redux)

```mermaid
graph TD
    Store[Root Store]
    
    App[App Module]
    Auth[Auth Module]
    Datastore[Datastore Module]
    Env[Env Module]
    
    Store --> App
    Store --> Auth
    Store --> Datastore
    Store --> Env
    
    App --> AppState[State: data, logs, workouts]
    App --> AppMutations[Mutations: SET_DAY_LOG, SET_WORKOUT]
    App --> AppActions[Actions: setDayLog, mapFromDatastore]
    App --> AppGetters[Getters: getDayLog, mapToDatastore]
    
    Auth --> AuthState[State: token, user, role]
    Auth --> AuthMutations[Mutations: SET_TOKEN, SET_USER]
    Auth --> AuthActions[Actions: login, logout]
    Auth --> AuthGetters[Getters: isAuthenticated, isAdmin]
    
    style Store fill:#e1f5ff,stroke:#0288d1,stroke-width:3px
    style App fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style Auth fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style Datastore fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style Env fill:#fffde7,stroke:#f9a825,stroke-width:2px
```

## Action → Mutation → State Flow

```mermaid
graph LR
    Component[Component]
    Action[Action: setWorkout]
    Mutation[Mutation: SET_WORKOUT]
    State[State: logs workouts]
    Getter[Getter: getWorkout]
    
    Component -->|dispatch| Action
    Action -->|commit| Mutation
    Mutation -->|updates| State
    State -->|accessed via| Getter
    Getter -->|read by| Component
    
    style Component fill:#e1f5ff
    style Action fill:#fff3e0
    style Mutation fill:#ffebee
    style State fill:#e8f5e9
    style Getter fill:#f3e5f5
```

## Example: Full Vuex Store Architecture

```mermaid
graph TD
    subgraph "Root Store"
        Index[store/index.js]
    end
    
    subgraph "App Module"
        AppState[State<br/>data, logs, workouts]
        AppMutations[Mutations<br/>SET_DAY_LOG<br/>SET_WORKOUT<br/>SET_LOGS]
        AppActions[Actions<br/>setDayLog<br/>setWorkout<br/>mapFromDatastore]
        AppGetters[Getters<br/>getDayLog<br/>getWorkout<br/>mapToDatastore]
    end
    
    subgraph "Auth Module"
        AuthState[State<br/>token, user, role]
        AuthMutations[Mutations<br/>SET_TOKEN<br/>SET_USER<br/>SET_ROLE]
        AuthActions[Actions<br/>login<br/>logout<br/>verifyToken]
        AuthGetters[Getters<br/>isAuthenticated<br/>isAdmin<br/>getRole]
    end
    
    subgraph "Datastore Module"
        DatastoreState[State<br/>entry, entryId<br/>entryLoaded]
        DatastoreMutations[Mutations<br/>SET_ENTRY<br/>SET_ENTRY_ID<br/>SET_LOADED]
        DatastoreGetters[Getters<br/>getEntry<br/>isLoaded]
    end
    
    Index --> AppState
    Index --> AuthState
    Index --> DatastoreState
    
    AppActions --> AppMutations
    AppMutations --> AppState
    AppState --> AppGetters
    
    AuthActions --> AuthMutations
    AuthMutations --> AuthState
    AuthState --> AuthGetters
    
    DatastoreMutations --> DatastoreState
    DatastoreState --> DatastoreGetters
    
    style Index fill:#e1f5ff,stroke:#0288d1,stroke-width:3px
    style AppState fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style AuthState fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style DatastoreState fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
```

## Data Flow Through Store

```mermaid
sequenceDiagram
    participant Component
    participant Action
    participant API
    participant Mutation
    participant State
    
    Component->>Action: dispatch('saveData', payload)
    activate Action
    
    Action->>API: Call external API
    API-->>Action: Response data
    
    Action->>Mutation: commit('SET_DATA', data)
    activate Mutation
    Mutation->>State: Update state
    deactivate Mutation
    
    State-->>Component: Reactive update
    deactivate Action
```

## State Access Patterns

### Component Integration

```mermaid
graph TD
    Component[Vue Component]
    
    MapState[mapState]
    MapGetters[mapGetters]
    MapActions[mapActions]
    MapMutations[mapMutations]
    
    Component -.->|computed| MapState
    Component -.->|computed| MapGetters
    Component -.->|methods| MapActions
    Component -.->|methods| MapMutations
    
    MapState -->|accesses| State[Store State]
    MapGetters -->|uses| Getters[Store Getters]
    MapActions -->|dispatches| Actions[Store Actions]
    MapMutations -->|commits| Mutations[Store Mutations]
    
    style Component fill:#e1f5ff
    style State fill:#e8f5e9
    style Actions fill:#fff3e0
    style Mutations fill:#ffebee
    style Getters fill:#f3e5f5
```

## Module Dependencies

```mermaid
graph TD
    App[App Module]
    Auth[Auth Module]
    Datastore[Datastore Module]
    
    API[API Services]
    DataSchema[Data Schema]
    
    App -->|imports| DataSchema
    App -->|uses| API
    Auth -->|uses| API
    Datastore -->|no dependencies| Independent
    
    Components[Components] -.->|reads| App
    Components -.->|reads| Auth
    Components -.->|reads| Datastore
    
    style App fill:#e8f5e9
    style Auth fill:#fff3e0
    style Datastore fill:#f3e5f5
    style Components fill:#e1f5ff
```

## State Machine Pattern

For actual state transitions:

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Loading: Fetch Data
    Loading --> Loaded: Success
    Loading --> Error: Failure
    
    Loaded --> Saving: Update Data
    Saving --> Loaded: Success
    Saving --> Error: Failure
    
    Error --> Idle: Reset
    Loaded --> Idle: Clear
```

## Async Action Pattern

```mermaid
graph TD
    Component[Component Dispatch]
    Action[Async Action]
    API[API Call]
    
    MutationPending[Mutation: SET_LOADING]
    MutationSuccess[Mutation: SET_DATA]
    MutationError[Mutation: SET_ERROR]
    
    State[State Update]
    
    Component --> Action
    Action --> MutationPending
    MutationPending --> State
    
    Action --> API
    
    API -->|Success| MutationSuccess
    API -->|Error| MutationError
    
    MutationSuccess --> State
    MutationError --> State
    
    State --> Component
    
    style Action fill:#fff3e0
    style MutationPending fill:#e3f2fd
    style MutationSuccess fill:#e8f5e9
    style MutationError fill:#ffebee
```

## Getters and Computed State

```mermaid
graph LR
    State[Raw State<br/>logs: {...}]
    
    Getter1[Getter: getDayLog<br/>Returns log for date]
    Getter2[Getter: getWorkout<br/>Returns workout for date]
    Getter3[Getter: mapToDatastore<br/>Transforms to JSON]
    
    Component1[DayLogPanel]
    Component2[WorkoutBuilder]
    Component3[App]
    
    State --> Getter1
    State --> Getter2
    State --> Getter3
    
    Getter1 --> Component1
    Getter2 --> Component2
    Getter3 --> Component3
    
    style State fill:#e8f5e9
    style Getter1 fill:#f3e5f5
    style Getter2 fill:#f3e5f5
    style Getter3 fill:#f3e5f5
```

## Pinia Store Pattern (Vue 3 Alternative)

```mermaid
graph TD
    UserStore[useUserStore]
    
    StoreState[State<br/>ref & reactive]
    StoreActions[Actions<br/>Functions]
    StoreGetters[Getters<br/>Computed]
    
    UserStore --> StoreState
    UserStore --> StoreActions
    UserStore --> StoreGetters
    
    Component[Component] -->|const store = useUserStore| UserStore
    Component -->|store.state| StoreState
    Component -->|store.action| StoreActions
    Component -->|store.getter| StoreGetters
    
    style UserStore fill:#e1f5ff,stroke:#0288d1,stroke-width:3px
    style Component fill:#e8f5e9
```

## Redux Pattern (React)

```mermaid
graph LR
    Component[React Component]
    Action[Action Creator]
    Dispatch[dispatch]
    Reducer[Reducer]
    Store[Redux Store]
    
    Component -->|calls| Action
    Action -->|returns action| Dispatch
    Dispatch -->|sends to| Reducer
    Reducer -->|updates| Store
    Store -->|subscribes| Component
    
    style Component fill:#e1f5ff
    style Action fill:#fff3e0
    style Reducer fill:#ffebee
    style Store fill:#e8f5e9
```

## Best Practices

1. **Show module boundaries:** Clear separation of concerns
2. **Indicate flow direction:** Actions → Mutations → State → Getters
3. **Label relationships:** "commits", "dispatches", "accesses"
4. **Group by module:** Use subgraphs for clarity
5. **Show async patterns:** API calls in actions
6. **Component integration:** How components access store
7. **State shape:** Include key state properties

## Common Patterns to Document

### Module Structure

- What modules exist
- What they're responsible for
- Dependencies between modules

### Data Flow

- How actions trigger mutations
- How state updates propagate
- How getters compute derived state

### Component Integration

- mapState, mapGetters usage
- mapActions, mapMutations usage
- Direct store access patterns

### Async Operations

- API calls in actions
- Loading/error states
- Optimistic updates

## Anti-Patterns

❌ Direct state mutation from components  
❌ Unclear action vs mutation responsibilities  
❌ Missing async operation handling  
❌ No module organization  
❌ Circular dependencies between modules

## Adding Context

```markdown
**Vuex Store Architecture**

**Modules:**
- **App:** Application state (logs, workouts, data schema)
- **Auth:** Authentication state (token, user, role)
- **Datastore:** External persistence (entry, loading state)
- **Env:** Environment configuration (feature flags)

**Data Flow:**
1. Components dispatch actions (async operations)
2. Actions call APIs and commit mutations
3. Mutations update state (synchronous only)
4. Getters provide computed/derived state
5. Components reactively update from state

**Key Patterns:**
- `mapFromDatastore`: Action that transforms external data to state
- `mapToDatastore`: Getter that transforms state to external format
- Watchers in App.vue synchronize Datastore and App modules
- Auth guards use getters to check permissions

**Integration:**
- Components use mapState/mapGetters for reading
- Components use mapActions for writing
- Mixin pattern (DatastoreAPI) provides reusable store operations
```

## Variations

### Architecture View

Show overall store structure and modules

### Flow View

Show action → mutation → state → getter flow

### Integration View

Show how components interact with store

### Module Detail

Deep dive into one module's structure

Choose based on what aspect user wants to understand.
