# PRD — Ryelthon & Thayna Wedding Website

## 1. Product Overview
- Nome do produto
- Casal
- Data do casamento
- Contexto

## 2. Product Goal
- Apresentar o casamento
- Centralizar informações
- Permitir RSVP
- Facilitar gestão dos convidados

## 3. Target Users
### Convidado
- Visualiza informações
- Confirma presença
- Altera resposta

### Administrador
- Gerencia convites
- Gerencia convidados
- Acompanha confirmações

## 4. MVP Scope
### Public Website
- Hero
- Data
- Horário
- Local
- Mapa
- Dress code
- Fotos
- Countdown
- RSVP

### Admin
- Login
- Dashboard
- CRUD de convites
- CRUD de convidados
- Busca
- Filtro
- CSV

## 5. User Flows
### Guest RSVP
Site → código → convite → respostas → confirmação

### Admin
Login → dashboard → convite → convidados → código

## 6. Functional Requirements

RF01 — Wedding landing page
RF02 — Countdown
RF03 — Venue
RF04 — Dress code
RF05 — Invitation code lookup
RF06 — Group invitations
RF07 — Individual RSVP
...

## 7. Business Rules

RN01 — Só convidados previamente cadastrados podem responder.

RN02 — Um convite pode conter várias pessoas.

RN03 — Cada pessoa possui resposta individual.

RN04 — Não existe +1.

RN05 — Código é associado ao convite.

RN06 — RSVP pode ser alterado antes do prazo.

RN07 — Após o prazo, alterações são bloqueadas.

RN08 — Crianças podem ser marcadas como não exigindo RSVP.

## 8. Admin Requirements
- Indicadores
- Busca
- Filtros
- Exportação
- Edição
- Exclusão

## 9. UX Requirements
- Mobile-first
- Elegante
- Fácil de usar
- Feedback de loading/error/success

## 10. Privacy and Security Requirements
- Lista de convidados não pública
- Código só revela seu convite
- Admin protegido
- Dados privados não expostos

## 11. Priorities
### P0
Essencial para lançamento

### P1
Importante

### P2
Futuro

## 12. Out of Scope
- Lista de presentes
- Pagamentos
- +1
- Galeria completa
- WhatsApp API
- etc.

## 13. Acceptance Criteria
- Admin consegue criar convite
- Código é gerado
- Convidado consegue usar código
- RSVP é persistido
- Dashboard atualiza
- CSV exporta
- etc.

## 14. Open Questions
- Horário
- Local
- Endereço
- Data limite RSVP
- Paleta
- Fontes
- Fotos
- História do casal