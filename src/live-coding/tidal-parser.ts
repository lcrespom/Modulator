export class TidalParser {
	tokens: Token[]
	tokenPos: number
	error: ParseError | null

	parse(s: string, time = 1) {
		this.tokens = new Tokenizer().tokenize(s)
		this.tokenPos = 0
		this.error = null
		try {
			let node = this.parseNode()
			let events: NoteEvent[] = []
			this.expand(events, node, time, 0)
			return events
		} catch (err) {
			if (!err.tk) throw err
			this.error = err
			return null
		}
	}

	expand(events: NoteEvent[], node: NoteNode, time: number, start: number) {
		let t = time / node.children.length
		let i = 0
		for (let ch of node.children) {
			if ((<NoteNode>ch).children) {
				this.expand(events, (<NoteNode>ch), t, start + t * i)
			}
			else {
				let nev = <NoteEvent>ch
				events.push({ instr: nev.instr, time: start + t * i })
			}
			i++
		}
	}

	parseNode() {
		let node: NoteNode = { children: [] }
		let end = false
		while (!this.finished() && !end) {
			let t = this.nextToken()
			if (t.text == ']')
				end = true
			else if (t.text == '[')
				node.children.push(this.parseNode())
			else if (t.type == TokenType.Identifier)
				node.children.push(this.parseInstr(t.text))
			else
				throw new ParseError(t, `Expecting instrument or '['`)
		}
		return node
	}

	parseInstr(name: string) {
		let t = this.peekToken()
		if (t.type == TokenType.Symbol && t.text == '*') {
			t = this.nextToken()	// Move past "*"
			t = this.nextToken()	// Get number
			if (t.type != TokenType.Number)
				throw new ParseError(t, 'Expecting a number')
			let repeat = parseInt(t.text, 10)
			let node: NoteNode = { children: [] }
			for (let i = 0; i < repeat; i++)
				node.children.push({ instr: name, time: 0 })
			return node
		}
		else return { instr: name, time: 0 }
	}

	nextToken() {
		let tk = this.tokens[this.tokenPos]
		this.tokenPos++
		return tk
	}

	peekToken() {
		if (this.finished()) {
			let lastToken = this.tokens[this.tokens.length - 1]
			return {
				type: TokenType.Error,
				text: 'EOF',
				pos: lastToken.pos + lastToken.text.length
			}
		}
		return this.tokens[this.tokenPos]
	}

	finished() {
		return this.tokenPos >= this.tokens.length
	}

}

/*
Grammar:
EXPR =
	  ident
	| ident EXPR
	| ident * num
	| [ EXPR ]
*/

class ParseError {
	constructor(public tk: Token, public msg: string) {}
}

class Tokenizer {
	tokens: Token[] = []
	token: Token = { type: TokenType.Error, text: '', pos: 0 }

	tokenize(s: string) {
		for (let i = 0; i < s.length; i++) {
			let c = s[i]
			if ('[] +-*/,'.includes(c)) {
				if (this.token.text.length > 0) this.pushToken()
				if (c != ' ')
					this.pushToken({ type: TokenType.Symbol, text: c, pos: i })
			}
			else if (this.token.text.length == 0) {
				this.token.text += c
				this.token.pos = i
				if (isNumber(c))
					this.token.type = TokenType.Number
				else if (isIdentifier(c))
					this.token.type = TokenType.Identifier
				else
					this.token.type = TokenType.Error
			}
			else if (isIdentifier) this.token.text += c
			else {
				this.pushToken()
				this.pushToken({ type: TokenType.Error, text: c, pos: i })
			}
		}
		if (this.token.text.length > 0) this.pushToken()
		return this.tokens
	}

	pushToken(tk?: Token) {
		if (tk)
			this.tokens.push(tk)
		else
			this.tokens.push(Object.assign({}, this.token))
		this.token.text = ''
	}

}

function isNumber(c: string) {
	return c >= '0' && c <= '9'
}

function isIdentifier(c: string) {
	return isNumber(c) ||
		c >= 'A' && c <= 'Z' ||
		c >= 'a' && c <= 'z' ||
		c == '_'
}


enum TokenType { Symbol, Identifier, Number, Error }

interface Token {
	type: TokenType
	text: string
	pos: number
}

type NoteData = NoteNode | NoteEvent

interface NoteNode {
	children: NoteData[]
}

interface NoteEvent {
	instr: string
	time: number
	number?: number
	velocity?: number
}
