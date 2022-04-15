https://www.npmjs.com/package/type-fest

## eventnames


###client sends:
- join
- cursorUpdated
- gridUpdated
- leave

###server sends:
- playerCreated
  - sends:
    - playerID
- gameCreated
  - sends:
    - solution
- playerStatesUpdated
  - when:
    - player joined
    - cursor moved
  - sends:
      - players (with their cursors)
- gridUpdated
  - grid