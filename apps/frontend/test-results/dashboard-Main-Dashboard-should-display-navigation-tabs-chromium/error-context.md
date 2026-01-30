# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e3]:
    - heading "Что-то пошло не так" [level=2] [ref=e4]
    - paragraph [ref=e5]: Произошла непредвиденная ошибка
    - button "Попробуйте ещё раз" [ref=e6] [cursor=pointer]
  - generic [ref=e9] [cursor=pointer]:
    - img [ref=e10]
    - generic [ref=e12]: 4 errors
    - button "Hide Errors" [ref=e13]:
      - img [ref=e14]
```