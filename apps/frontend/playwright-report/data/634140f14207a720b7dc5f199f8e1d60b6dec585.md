# Page snapshot

```yaml
- generic [ref=e1]:
  - alert [ref=e2]
  - generic "Notifications"
  - generic [ref=e3]:
    - generic [ref=e4]:
      - button "Назад" [ref=e5] [cursor=pointer]:
        - img [ref=e6]
        - text: Назад
      - generic [ref=e9] [cursor=pointer]:
        - generic [ref=e10]: 🇷🇺
        - generic [ref=e11]: RU
        - img [ref=e12]
    - generic [ref=e15]:
      - generic [ref=e16]:
        - heading "Войти по номеру" [level=2] [ref=e17]
        - paragraph [ref=e18]: Введите номер телефона для получения кода
      - generic [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]: Номер телефона
          - generic [ref=e22]:
            - generic:
              - img
            - textbox "Номер телефона" [active] [ref=e23]:
              - /placeholder: +7 (___) ___-__-__
        - button "Получить код" [disabled] [ref=e24]:
          - text: Получить код
          - img [ref=e25]
      - generic [ref=e29]: или
      - button "Войти через Telegram" [ref=e31] [cursor=pointer]:
        - img [ref=e32]
        - text: Войти через Telegram
      - paragraph [ref=e35]:
        - strong [ref=e36]: "Демо:"
        - text: "Введите любой номер формата +7 (XXX) XXX-XX-XX. Код подтверждения: 1234"
```