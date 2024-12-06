import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { FaHome, FaCode, FaBook } from 'react-icons/fa'
import { useState, useRef, useEffect } from 'react'
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
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

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

  const handleFileUpload = (file) => {
    if (!file) return

    if (!file.name.endsWith('.js') && !file.name.endsWith('.jsx')) {
      setError('Please upload a .js or .jsx file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target.result
        setInputCode(content)
        setError(null)
      } catch (err) {
        setError('Error reading file: ' + err.message)
      }
    }
    reader.onerror = () => {
      setError('Error reading file')
    }
    reader.readAsText(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFileUpload(file)
  }

  return (
    <>
      {/* Toast Container */}
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">Input React JS Code</h2>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".js,.jsx"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                  />
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Upload File
                  </button>
                  {inputCode && (
                    <button
                      className="btn btn-sm btn-outline btn-error"
                      onClick={() => setInputCode('')}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <div
                className={`relative ${isDragging ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isDragging && (
                  <div className="absolute inset-0 bg-base-200 bg-opacity-90 flex items-center justify-center z-10 border-2 border-dashed border-primary rounded-lg">
                    <p className="text-lg font-semibold">Drop your file here</p>
                  </div>
                )}
                <textarea 
                  className="textarea textarea-bordered h-96 font-mono text-sm whitespace-pre w-full"
                  placeholder="Paste your React JS code here or drag & drop a file..."
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  style={{ tabSize: 2 }}
                />
              </div>
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

const Docs = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const codeExample = `// React JS Code
function Button({ onClick, children }) {
  return (
    <button 
      className="bg-blue-500 text-white p-4 rounded"
      onClick={onClick}
    >
      {children}
    </button>
  )
}`

  const convertedExample = `// React Native Code
import { TouchableOpacity, Text } from 'react-native';

function Button({ onPress, children }) {
  return (
    <TouchableOpacity 
      style={{
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 8,
      }}
      onPress={onPress}
    >
      <Text style={{ color: '#FFFFFF' }}>
        {children}
      </Text>
    </TouchableOpacity>
  )
}`

  const conversionRules = [
    {
      title: 'HTML Elements',
      original: '<div>, <p>, <span>',
      converted: '<View>, <Text>, <Text>',
      description: 'Basic HTML elements are converted to their React Native equivalents.'
    },
    {
      title: 'Event Handlers',
      original: 'onClick, onChange',
      converted: 'onPress, onChangeText',
      description: 'DOM events are mapped to React Native touch events.'
    },
    {
      title: 'Styling',
      original: 'className with CSS',
      converted: 'style with React Native properties',
      description: 'CSS classes are converted to inline styles with React Native compatible properties.'
    },
    {
      title: 'Images',
      original: '<img src="..." />',
      converted: '<Image source={require("...")} />',
      description: 'Image elements are converted to React Native Image components with proper source handling.'
    }
  ]

  const sections = {
    overview: (
      <div className="space-y-6">
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-2xl">What is Web2Native?</h2>
            <p className="text-lg">
              Web2Native is a powerful tool that converts your React JS web components into React Native code, 
              making it easier to transition from web to mobile development. It handles the conversion of HTML elements, 
              styling, and event handlers automatically.
            </p>
          </div>
        </div>

        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-2xl">Key Features</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Automatic conversion of HTML elements to React Native components</li>
              <li>CSS to React Native style conversion</li>
              <li>Event handler mapping</li>
              <li>Support for file upload and drag-and-drop</li>
              <li>Proper code formatting and indentation</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    examples: (
      <div className="space-y-6">
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-2xl">Example Conversion</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">React JS Input:</h3>
                <pre className="bg-base-300 p-4 rounded-lg overflow-x-auto">
                  <code>{codeExample}</code>
                </pre>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">React Native Output:</h3>
                <pre className="bg-base-300 p-4 rounded-lg overflow-x-auto">
                  <code>{convertedExample}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    rules: (
      <div className="space-y-6">
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-2xl">Conversion Rules</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>React JS</th>
                    <th>React Native</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {conversionRules.map((rule, index) => (
                    <tr key={index}>
                      <td className="font-semibold">{rule.title}</td>
                      <td><code>{rule.original}</code></td>
                      <td><code>{rule.converted}</code></td>
                      <td>{rule.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    ),
    tips: (
      <div className="space-y-6">
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-2xl">Best Practices</h2>
            <div className="space-y-4">
              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h3 className="font-bold">Clean Your Code First</h3>
                  <p>Remove any web-specific features and unused imports before conversion.</p>
                </div>
              </div>

              <div className="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-bold">Use Simple Styling</h3>
                  <p>Stick to basic CSS properties that have direct React Native equivalents.</p>
                </div>
              </div>

              <div className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="font-bold">Check Platform-Specific Code</h3>
                  <p>Review and adjust any code that relies on web-specific APIs or features.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Documentation</h1>
      
      <div className="tabs tabs-boxed mb-6">
        <a 
          className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </a>
        <a 
          className={`tab ${activeTab === 'examples' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('examples')}
        >
          Examples
        </a>
        <a 
          className={`tab ${activeTab === 'rules' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          Conversion Rules
        </a>
        <a 
          className={`tab ${activeTab === 'tips' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('tips')}
        >
          Best Practices
        </a>
      </div>

      {sections[activeTab]}
    </div>
  )
}

function App() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Router>
      <div className="drawer">
        <input id="my-drawer-3" type="checkbox" className="drawer-toggle" /> 
        <div className="drawer-content flex flex-col w-full">
          {/* Navbar */}
          <div className={`w-full navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 ${
            isScrolled ? 'bg-base-300 shadow-lg' : 'bg-base-300 bg-opacity-90 backdrop-blur'
          }`}>
            <div className="max-w-7xl w-full mx-auto grid grid-cols-3 items-center">
              <div className="flex items-center">
                <div className="flex-none lg:hidden">
                  <label htmlFor="my-drawer-3" className="btn btn-square btn-ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                  </label>
                </div>
                <Link to="/" className="btn btn-ghost normal-case text-xl gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Web2Native
                </Link>
              </div>

              <div className="hidden lg:flex justify-center">
                <ul className="menu menu-horizontal px-1 gap-2">
                  <li>
                    <Link 
                      to="/" 
                      className="flex items-center gap-2 hover:bg-primary hover:text-primary-content rounded-lg transition-colors"
                    >
                      <FaHome className="h-5 w-5" />
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/converter" 
                      className="flex items-center gap-2 hover:bg-primary hover:text-primary-content rounded-lg transition-colors"
                    >
                      <FaCode className="h-5 w-5" />
                      Converter
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/docs" 
                      className="flex items-center gap-2 hover:bg-primary hover:text-primary-content rounded-lg transition-colors"
                    >
                      <FaBook className="h-5 w-5" />
                      Docs
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="flex justify-end">
                <label className="swap swap-rotate btn btn-ghost btn-circle">
                  <input type="checkbox" className="theme-controller" value="synthwave" />
                  <svg className="swap-on fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                  </svg>
                  <svg className="swap-off fill-current w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                  </svg>
                </label>
              </div>
            </div>
          </div>

          {/* Main content with padding for fixed navbar */}
          <div className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/converter" element={<Converter />} />
              <Route path="/docs" element={<Docs />} />
            </Routes>
          </div>
        </div> 

        {/* Mobile drawer */}
        <div className="drawer-side">
          <label htmlFor="my-drawer-3" className="drawer-overlay"></label> 
          <ul className="menu p-4 w-80 min-h-full bg-base-200">
            <li className="mb-4">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-lg font-semibold hover:bg-primary hover:text-primary-content"
                onClick={() => {
                  const drawerToggle = document.getElementById('my-drawer-3')
                  if (drawerToggle) drawerToggle.checked = false
                }}
              >
                <FaHome className="h-5 w-5" />
                Home
              </Link>
            </li>
            <li className="mb-4">
              <Link 
                to="/converter" 
                className="flex items-center gap-2 text-lg font-semibold hover:bg-primary hover:text-primary-content"
                onClick={() => {
                  const drawerToggle = document.getElementById('my-drawer-3')
                  if (drawerToggle) drawerToggle.checked = false
                }}
              >
                <FaCode className="h-5 w-5" />
                Converter
              </Link>
            </li>
            <li className="mb-4">
              <Link 
                to="/docs" 
                className="flex items-center gap-2 text-lg font-semibold hover:bg-primary hover:text-primary-content"
                onClick={() => {
                  const drawerToggle = document.getElementById('my-drawer-3')
                  if (drawerToggle) drawerToggle.checked = false
                }}
              >
                <FaBook className="h-5 w-5" />
                Docs
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </Router>
  )
}

export default App
