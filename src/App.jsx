import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { FaHome, FaCode, FaBook } from 'react-icons/fa'
import { useState } from 'react'
import './App.css'

// Pages
const Home = () => (
  <div className="min-h-screen p-8">
    <div className="hero bg-base-200 rounded-lg">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">React to React Native Converter</h1>
          <p className="py-6">Transform your React JS code into React Native with ease. Start converting your web components into mobile-ready code instantly.</p>
          <Link to="/converter" className="btn btn-primary">Get Started</Link>
        </div>
      </div>
    </div>
  </div>
)

const Converter = () => {
  const [inputCode, setInputCode] = useState('')
  const [outputCode, setOutputCode] = useState('')
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState(null)
  const [showToast, setShowToast] = useState(false)

  const formatCode = (code) => {
    // Basic indentation and formatting
    let formatted = code
      .replace(/</g, '\n<')  // New line before tags
      .replace(/>/g, '>\n')  // New line after tags
      .replace(/\n\s*\n/g, '\n')  // Remove extra empty lines
      .split('\n')
      .filter(line => line.trim())  // Remove empty lines
      .map(line => line.trim())  // Remove extra spaces

    // Add proper indentation
    let indent = 0
    formatted = formatted.map(line => {
      let spaces = '  '.repeat(indent)
      
      // Decrease indent for closing tags
      if (line.startsWith('</')) {
        indent--
        spaces = '  '.repeat(indent)
      }
      
      // Increase indent for opening tags (not self-closing)
      if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>')) {
        indent++
      }
      
      return spaces + line
    }).join('\n')

    return formatted
  }

  const convertHtmlToNative = (code) => {
    // Basic HTML to React Native mappings
    const elementMappings = {
      'div': 'View',
      'p': 'Text',
      'span': 'Text',
      'button': 'TouchableOpacity',
      'input': 'TextInput',
      'img': 'Image',
      'ul': 'View',
      'li': 'View',
      'h1': 'Text',
      'h2': 'Text',
      'h3': 'Text',
      'h4': 'Text',
      'h5': 'Text',
      'h6': 'Text',
    }

    // Replace HTML elements with React Native components
    let convertedCode = code
    Object.entries(elementMappings).forEach(([html, native]) => {
      const regex = new RegExp(`<${html}(\\s|>)`, 'g')
      convertedCode = convertedCode.replace(regex, `<${native}$1`)
      const closeRegex = new RegExp(`</${html}>`, 'g')
      convertedCode = convertedCode.replace(closeRegex, `</${native}>`)
    })

    // Convert className to style
    convertedCode = convertedCode.replace(/className=/g, 'style=')

    // Convert CSS-style strings to React Native style objects
    convertedCode = convertedCode.replace(/style="([^"]*)"/, (match, styles) => {
      const styleObj = styles.split(';')
        .filter(style => style.trim())
        .map(style => {
          const [property, value] = style.split(':').map(s => s.trim())
          // Convert kebab-case to camelCase
          const camelProperty = property.replace(/-([a-z])/g, g => g[1].toUpperCase())
          return `${camelProperty}: '${value}'`
        })
        .join(', ')
      return `style={{${styleObj}}}`
    })

    // Convert onClick to onPress
    convertedCode = convertedCode.replace(/onClick/g, 'onPress')

    // Add necessary imports
    const imports = `import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native';\n\n`

    return formatCode(imports + convertedCode)
  }

  const handleConversion = () => {
    try {
      setIsConverting(true)
      setError(null)

      if (!inputCode.trim()) {
        throw new Error('Please enter some React JS code to convert')
      }

      const convertedCode = convertHtmlToNative(inputCode)
      setOutputCode(convertedCode)
    } catch (err) {
      setError(err.message)
      setOutputCode('')
    } finally {
      setIsConverting(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputCode)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2000)
    } catch (err) {
      setError('Failed to copy code to clipboard')
    }
  }

  return (
    <>
      {/* Toast Container - Fixed position outside the main content */}
      <div className="fixed top-4 right-4 z-50">
        {showToast && (
          <div className="alert alert-success shadow-lg animate-fadeIn">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Code copied successfully!</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="min-h-screen p-8 relative">
        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title">Input React JS Code</h2>
              <textarea 
                className="textarea textarea-bordered h-96 font-mono text-sm whitespace-pre"
                placeholder="Paste your React JS code here..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                style={{ tabSize: 2 }}
              />
            </div>
          </div>
          <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title">Output React Native Code</h2>
              <textarea 
                className="textarea textarea-bordered h-96 font-mono text-sm whitespace-pre"
                placeholder="Converted React Native code will appear here..."
                value={outputCode}
                readOnly
                style={{ tabSize: 2 }}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-4">
          <button 
            className={`btn btn-primary ${isConverting ? 'loading' : ''}`}
            onClick={handleConversion}
            disabled={isConverting}
          >
            {isConverting ? 'Converting...' : 'Convert Code'}
          </button>
          {outputCode && (
            <button 
              className="btn btn-secondary"
              onClick={handleCopy}
            >
              Copy Output
            </button>
          )}
        </div>
      </div>
    </>
  )
}

const Docs = () => (
  <div className="min-h-screen p-8">
    <div className="prose lg:prose-xl mx-auto">
      <h1>Documentation</h1>
      <h2>How to Use the Converter</h2>
      <ol>
        <li>Paste your React JS code in the input field</li>
        <li>Click the Convert button</li>
        <li>Review the generated React Native code</li>
        <li>Copy and use in your React Native project</li>
      </ol>
      <h2>Conversion Guidelines</h2>
      <ul>
        <li>HTML elements will be converted to their React Native equivalents</li>
        <li>CSS properties will be transformed into React Native style objects</li>
        <li>Event handlers will be adapted for mobile interactions</li>
      </ul>
    </div>
  </div>
)

function App() {
  return (
    <Router>
      <div className="drawer">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" /> 
        <div className="drawer-content flex flex-col">
          {/* Navbar */}
          <div className="w-full navbar bg-base-300">
            <div className="flex-none lg:hidden">
              <label htmlFor="my-drawer-3" className="btn btn-square btn-ghost">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </label>
            </div> 
            <div className="flex-1 px-2 mx-2">Web2Native</div>
            <div className="flex-none hidden lg:block">
              <ul className="menu menu-horizontal">
                <li><Link to="/"><FaHome className="mr-2" /> Home</Link></li>
                <li><Link to="/converter"><FaCode className="mr-2" /> Converter</Link></li>
                <li><Link to="/docs"><FaBook className="mr-2" /> Docs</Link></li>
              </ul>
            </div>
          </div>
          {/* Main content */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/converter" element={<Converter />} />
            <Route path="/docs" element={<Docs />} />
          </Routes>
        </div> 
        <div className="drawer-side">
          <label htmlFor="my-drawer-3" className="drawer-overlay"></label> 
          <ul className="menu p-4 w-80 min-h-full bg-base-200">
            <li><Link to="/"><FaHome className="mr-2" /> Home</Link></li>
            <li><Link to="/converter"><FaCode className="mr-2" /> Converter</Link></li>
            <li><Link to="/docs"><FaBook className="mr-2" /> Docs</Link></li>
          </ul>
        </div>
      </div>
    </Router>
  )
}

export default App
