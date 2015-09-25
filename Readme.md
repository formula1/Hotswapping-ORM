### Roadmap

1. Finish up the hotswapping
  - Add a disconnect method to every dependency which will result in the removal of the object
2. Refactor Adapters/Connections
  - these should be abstract classes that an implementer must override
  - Sepcificlaly CRUD interface for docs
  - Ability to drop, modify or create tables
  - Ability to connect and disconnect from a database with credentials
3. Live updates
  - Middleware that can be distributed across distributed systems
  - This includes Cross Container as well as clusters
4. Start Handling Schema Types
  - Size Constraints
    - Stream - for arbitrarilly and likely large data (has to be populated)
    - Buffer - for arbitrarilly large though likely between 0 and maybe like 12k? (not stream status)
    - Constrained - for an explicit size that is locked into a minimum and maximum
  - Special Types
    - objectid - Specifies another instance (model and id) in a table (maybe same maybe not)
    - array - enables an array of values
    - transaction
      - We store the entire sequence of Actions when before we begin
      - we store the entire sequence of actions where we do each action as we do each action
      - We then remove the sequence from where we started
      - If at any point something goes wrong
        - The original sequence will still be available
        - We then see if each other action has happened
          -Yes, continue
          - This is where we left off

  - Common Constraints that is associated with this
    - Index - Causes it to be sorted
    - Unique - Causes it to be sorted and prevents
    - Regex
    - Number
  - Arrays
    - Constraints
      - any-Any of the values must be one specified
      - all-All specified must be in the array of values
      - more-So long as there is more than the specified values, its ok
      - !any-Not a single one of the specified values can be in the array
      - !all-The Array is invalid if all of the specified values are in it
      - !more-The Array can only consist of specified values (Enum)
    - Array Provides
      - Hardcoded
      - a function that is with access to the doc
      - a promise
      - a stream - values are streamed out, each one may be applicable, maybe not
  - Custom Validators
    - Returning false
    - Throwing errors to show falsy
    - Promise Validators - Returning a promise will result in an async validator
    - A Stream - We then write to the stream, and wait for an error or data
5. Transactions
6. Start Tearing out abstract modules
  - dependency
    - I'm not sure if it is truly independent though I've tried to make it
    - I'm not even sure a usecase as I've designed it to eacily need an event EventEmitter
  - MiddlewareResolver
    - This is arguably more imprtant than