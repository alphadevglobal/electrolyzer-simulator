# NETWORK 6: CONTROLE DO TRANSELEVADOR (STACKER CRANE)

## VISÃO GERAL

Este network implementa o controle completo do transelevador (Stacker Crane) para armazenamento vertical de pallets de hidrogênio verde. O sistema utiliza uma máquina de estados (State Machine) para garantir operação segura e sequencial.

---

## ARQUITETURA DO TRANSELEVADOR

### Especificações Físicas
- **Níveis de Armazenamento:** 3 (Nível 1, 2 e 3)
- **Colunas por Nível:** 4
- **Capacidade Total:** 12 pallets
- **Posição Home:** Nível 0 (piso), posição recuada

### Movimentos
1. **Vertical:** Subir/Descer (entre Home e Níveis 1-3)
2. **Horizontal:** Avançar/Recuar (para pegar/soltar pallet)
3. **Garra:** Abrir/Fechar (para manipular pallet)

---

## MÁQUINA DE ESTADOS

### Estados do Transelevador

| Estado | Código | Descrição |
|--------|--------|-----------|
| IDLE | 0 | Aguardando comando, em posição Home |
| SUBINDO | 1 | Movimento vertical para cima |
| DESCENDO | 2 | Movimento vertical para baixo |
| AVANCANDO | 3 | Movimento horizontal para frente |
| RECUANDO | 4 | Movimento horizontal para trás |
| PEGANDO_PALLET | 5 | Fechando garra para pegar pallet |
| SOLTANDO_PALLET | 6 | Abrindo garra para soltar pallet |
| ERRO | 99 | Estado de erro/segurança |

---

## LÓGICA LADDER - NETWORK 6

### 6.1 - Inicialização e Reset

```ladder
Network 6.1: Inicialização do Transelevador
─────────────────────────────────────────────────

     ┌──┤ Reset_Btn ├──┤ Sistema_Ativo ├──( R )─ Transel_Estado
     │                                      ( R )─ Transel_Erro
     │                                      ( S )─ Transel_Pos_Home (forçar retorno)
     │
     └──┤/Transel_Garra_Fechada ├──┤ Sistema_Ativo ├──( S )─ Transel_Erro
         (Se garra aberta durante movimento = ERRO)
```

**Descrição:**
- Botão Reset retorna transelevador ao estado IDLE e limpa erros
- Se garra não estiver fechada durante movimento, aciona flag de erro

---

### 6.2 - Trigger de Armazenamento (Quando Paletizador Completa)

```ladder
Network 6.2: Solicitar Armazenamento
─────────────────────────────────────

     ┌──┤ Palletizer_Unload ├──┤ Transel_Estado == 0 ├──┤/Transel_Erro ├──┐
     │                                                                      │
     │  ┌──┤ MOVE 1 ├─► Transel_Posicao_Destino                           │
     │  │                                                                   │
     │  └──┤ MOVE 1 ├─► Transel_Estado (vai para SUBINDO)                 │
     │                                                                      │
     └─────────────────────────────────────────────────────────────────────┘
```

**Descrição:**
- Quando paletizador libera pallet completo, transelevador inicia sequência
- Calcula próxima posição livre usando array `Matriz_Estoque[12]`

---

### 6.3 - Controle do Movimento Vertical (Subir/Descer)

```ladder
Network 6.3: Movimento Vertical - SUBIR
─────────────────────────────────────────

     ┌──┤ Transel_Estado == 1 ├──┤ Sistema_Ativo ├──┐
     │                                                │
     │  ┌──┤/Transel_Nivel_Destino_OK ├──( )─ Transel_Motor_Subir (%Q1.0)
     │  │
     │  └──┤ Transel_Nivel_Destino_OK ├──┐
     │       │                            │
     │       ├──( R )─ Transel_Motor_Subir
     │       │
     │       └──┤ MOVE 3 ├─► Transel_Estado (vai para AVANCANDO)
     │
     └───────────────────────────────────────────────────

Network 6.4: Movimento Vertical - DESCER
─────────────────────────────────────────

     ┌──┤ Transel_Estado == 2 ├──┤ Sistema_Ativo ├──┐
     │                                                │
     │  ┌──┤/Transel_Pos_Home ├──( )─ Transel_Motor_Descer (%Q1.1)
     │  │
     │  └──┤ Transel_Pos_Home ├──┐
     │       │                   │
     │       ├──( R )─ Transel_Motor_Descer
     │       │
     │       └──┤ MOVE 0 ├─► Transel_Estado (volta para IDLE)
     │
     └───────────────────────────────────────────────────
```

**Descrição:**
- Estado 1 (SUBINDO): Liga motor de subida até atingir sensor do nível desejado
- Estado 2 (DESCENDO): Liga motor de descida até atingir sensor de Home
- Quando atinge posição, muda para próximo estado automaticamente

---

### 6.5 - Controle do Movimento Horizontal (Avançar/Recuar)

```ladder
Network 6.5: Movimento Horizontal - AVANÇAR
────────────────────────────────────────────

     ┌──┤ Transel_Estado == 3 ├──┤ Sistema_Ativo ├──┐
     │                                                │
     │  ┌──┤/Transel_Avancado ├──( )─ Transel_Motor_Avancar (%Q1.2)
     │  │
     │  └──┤ Transel_Avancado ├──┐
     │       │                   │
     │       ├──( R )─ Transel_Motor_Avancar
     │       │
     │       └──┤ MOVE 6 ├─► Transel_Estado (vai para SOLTANDO_PALLET)
     │
     └───────────────────────────────────────────────────

Network 6.6: Movimento Horizontal - RECUAR
──────────────────────────────────────────

     ┌──┤ Transel_Estado == 4 ├──┤ Sistema_Ativo ├──┐
     │                                                │
     │  ┌──┤/Transel_Recuado ├──( )─ Transel_Motor_Recuar (%Q1.3)
     │  │
     │  └──┤ Transel_Recuado ├──┐
     │       │                  │
     │       ├──( R )─ Transel_Motor_Recuar
     │       │
     │       └──┤ MOVE 2 ├─► Transel_Estado (vai para DESCENDO)
     │
     └───────────────────────────────────────────────────
```

**Descrição:**
- Estado 3 (AVANÇANDO): Move horizontalmente até posição de armazenamento
- Estado 4 (RECUANDO): Retorna à posição recuada após soltar pallet

---

### 6.7 - Controle da Garra (Pegar/Soltar Pallet)

```ladder
Network 6.7: Operação da Garra - FECHAR (Pegar)
────────────────────────────────────────────────

     ┌──┤ Transel_Estado == 5 ├──┤ Sistema_Ativo ├──┐
     │                                                │
     │  ┌──┤/Transel_Garra_Fechada ├──( )─ Transel_Garra_Fechar (%Q1.5)
     │  │                              ( R )─ Transel_Garra_Abrir (%Q1.4)
     │  │
     │  └──┤ Transel_Garra_Fechada ├──┤ Timer_Garra.Q (500ms) ├──┐
     │       │                                                    │
     │       ├──( R )─ Transel_Garra_Fechar
     │       │
     │       └──┤ MOVE 4 ├─► Transel_Estado (vai para RECUANDO)
     │
     └────────────────────────────────────────────────────────────

Network 6.8: Operação da Garra - ABRIR (Soltar)
───────────────────────────────────────────────

     ┌──┤ Transel_Estado == 6 ├──┤ Sistema_Ativo ├──┐
     │                                                │
     │  ┌──┤/Transel_Garra_Aberta ├──( )─ Transel_Garra_Abrir (%Q1.4)
     │  │                             ( R )─ Transel_Garra_Fechar (%Q1.5)
     │  │
     │  └──┤ Transel_Garra_Aberta ├──┤ Timer_Garra.Q (500ms) ├──┐
     │       │                                                   │
     │       ├──( R )─ Transel_Garra_Abrir
     │       │
     │       └──┤ MOVE 5 ├─► Transel_Estado (vai para PEGANDO)
     │
     └──────────────────────────────────────────────────────────
```

**Descrição:**
- Estado 5 (PEGANDO_PALLET): Fecha garra para pegar pallet do paletizador
- Estado 6 (SOLTANDO_PALLET): Abre garra para depositar pallet na prateleira
- Timer de 500ms garante que garra complete movimento antes de avançar

---

### 6.9 - Atualização da Matriz de Estoque

```ladder
Network 6.9: Registrar Pallet Armazenado
─────────────────────────────────────────

     ┌──┤ Transel_Estado == 6 ├──┤ Transel_Garra_Aberta ├──┐
     │                                                       │
     │  ┌──┤ MOVE ├─► Matriz_Estoque[Posicao_Atual] := TRUE │
     │  │                                                    │
     │  ├──┤ ADD ├─► Contador_Pallets_Armazenados++         │
     │  │                                                    │
     │  └──┤ CALL FC_Calcular_Proxima_Posicao_Livre ├       │
     │                                                       │
     └───────────────────────────────────────────────────────
```

**Descrição:**
- Marca posição como ocupada no array de estoque
- Incrementa contador de pallets armazenados
- Calcula próxima posição livre para próximo armazenamento

---

## FUNÇÕES AUXILIARES

### FC_Calcular_Proxima_Posicao_Livre

```scl
FUNCTION FC_Calcular_Proxima_Posicao_Livre : Int
VAR_INPUT
    Matriz_Estoque : ARRAY[0..11] OF Bool;
END_VAR
VAR_OUTPUT
    Posicao_Livre : Int;
    Nivel : Int;
    Coluna : Int;
END_VAR

// Busca primeira posição livre (FALSE) no array
FOR i := 0 TO 11 DO
    IF NOT Matriz_Estoque[i] THEN
        Posicao_Livre := i;
        Nivel := (i DIV 4) + 1;  // 1, 2 ou 3
        Coluna := i MOD 4;        // 0, 1, 2 ou 3
        RETURN;
    END_IF;
END_FOR;

// Se não encontrou, retorna erro
Posicao_Livre := -1;
```

---

## TRATAMENTO DE ERROS E SEGURANÇA

### 6.10 - Segurança e Interlocks

```ladder
Network 6.10: Proteções de Segurança
─────────────────────────────────────

     ┌──┤ Emergency_Btn ├──( S )─ Transel_Erro
     │                      ( R )─ Transel_Motor_Subir
     │                      ( R )─ Transel_Motor_Descer
     │                      ( R )─ Transel_Motor_Avancar
     │                      ( R )─ Transel_Motor_Recuar
     │                      ( MOVE 99 )─ Transel_Estado
     │
     ├──┤ Transel_Em_Movimento ├──┤/Transel_Garra_Fechada ├──┐
     │   (Se mover com garra aberta = ERRO)                  │
     │                                                        │
     │   └──( S )─ Transel_Erro                              │
     │      ( MOVE 99 )─ Transel_Estado                      │
     │                                                        │
     └────────────────────────────────────────────────────────
```

**Proteções Implementadas:**
1. **Emergência:** Para todos os motores imediatamente
2. **Garra Aberta:** Não permite movimento se garra estiver aberta
3. **Timeout:** Se movimento não completar em 10s, aciona erro
4. **Sensores:** Verifica coerência de sensores antes de mover

---

## INTEGRAÇÃO COM O RESTANTE DO SISTEMA

### Sequência Completa de Armazenamento

1. **Paletizador completa pallet** → `Palletizer_Unload = TRUE`
2. **Network 6.2 detecta** → Inicia sequência do transelevador
3. **Estado IDLE → SUBINDO** → Sobe até nível calculado
4. **SUBINDO → AVANÇANDO** → Avança para posição de armazenamento
5. **AVANÇANDO → SOLTANDO** → Abre garra e deposita pallet
6. **SOLTANDO → RECUANDO** → Recua para posição segura
7. **RECUANDO → DESCENDO** → Desce para posição Home
8. **DESCENDO → IDLE** → Aguarda próximo pallet

### Tempo Total do Ciclo
- **Estimativa:** 15-20 segundos por pallet
- **Subida:** 3-5s por nível
- **Movimento horizontal:** 2s
- **Operação garra:** 1s
- **Descida:** 3-5s

---

## VISUALIZAÇÃO NA IHM

### Elementos a Adicionar na Tela IHM

1. **Indicador de Estado:**
   - Tag: `Transel_Estado`
   - Tipo: Text List (mostra "IDLE", "SUBINDO", etc.)

2. **Matriz de Ocupação:**
   - 12 círculos (3 linhas x 4 colunas)
   - Verde = vazio, Vermelho = ocupado
   - Tag: `Matriz_Estoque[0..11]`

3. **Contador de Pallets:**
   - Tag: `Contador_Pallets_Armazenados`
   - Formato: "XX / 12"

4. **Animação 3D (opcional):**
   - Simulação visual da posição do transelevador

---

## TESTES E VALIDAÇÃO

### Checklist de Testes

- [ ] Teste 1: Armazenar 1 pallet na posição [0,0] (Nível 1, Coluna 1)
- [ ] Teste 2: Armazenar sequencialmente 4 pallets (encher Nível 1)
- [ ] Teste 3: Armazenar pallet no Nível 3 (posição mais alta)
- [ ] Teste 4: Acionar emergência durante movimento (deve parar imediatamente)
- [ ] Teste 5: Simular erro de sensor (timeout deve ativar)
- [ ] Teste 6: Armazenar 12 pallets (capacidade total)
- [ ] Teste 7: Tentar armazenar 13º pallet (deve rejeitar - estoque cheio)

---

## CÓDIGO SCL COMPLETO (Alternativa ao Ladder)

Para quem preferir implementar em SCL ao invés de Ladder:

```scl
CASE Transel_Estado OF
    0: // IDLE
        IF Palletizer_Unload AND NOT Transel_Erro THEN
            Transel_Posicao_Destino := FC_Calcular_Proxima_Posicao_Livre();
            IF Transel_Posicao_Destino >= 0 THEN
                Transel_Estado := 1; // SUBINDO
            END_IF;
        END_IF;

    1: // SUBINDO
        Transel_Motor_Subir := TRUE;
        IF Sensor_Nivel[Transel_Posicao_Destino DIV 4] THEN
            Transel_Motor_Subir := FALSE;
            Transel_Estado := 3; // AVANÇANDO
        END_IF;

    3: // AVANÇANDO
        Transel_Motor_Avancar := TRUE;
        IF Transel_Avancado THEN
            Transel_Motor_Avancar := FALSE;
            Transel_Estado := 6; // SOLTANDO_PALLET
        END_IF;

    6: // SOLTANDO_PALLET
        Transel_Garra_Abrir := TRUE;
        Transel_Garra_Fechar := FALSE;
        IF Transel_Garra_Aberta AND Timer_Garra.Q THEN
            Matriz_Estoque[Transel_Posicao_Atual] := TRUE;
            Contador_Pallets_Armazenados := Contador_Pallets_Armazenados + 1;
            Transel_Estado := 4; // RECUANDO
        END_IF;

    4: // RECUANDO
        Transel_Motor_Recuar := TRUE;
        IF Transel_Recuado THEN
            Transel_Motor_Recuar := FALSE;
            Transel_Estado := 2; // DESCENDO
        END_IF;

    2: // DESCENDO
        Transel_Motor_Descer := TRUE;
        IF Transel_Pos_Home THEN
            Transel_Motor_Descer := FALSE;
            Transel_Estado := 0; // IDLE
        END_IF;

    99: // ERRO
        // Desliga todos os motores
        Transel_Motor_Subir := FALSE;
        Transel_Motor_Descer := FALSE;
        Transel_Motor_Avancar := FALSE;
        Transel_Motor_Recuar := FALSE;
        Luz_Processo_Vermelha := TRUE;
END_CASE;
```

---

**Documento:** Network_06_Transelevador.md
**Projeto:** H2 Green Factory - TIA Portal
**Versão:** 1.0
**Data:** Novembro 2025
**Autor:** Experimentação de Protótipos - AV3
