const sparqlRepo = 'https://raw.githubusercontent.com/per-lod-ad-astra/sparql-queries/main/'
window.onload = async () => {
  const debug = window.location.hostname === 'localhost'
  document.getElementById('swapBronnen').onclick = (ev) => swapBronnen(ev);
  fetch(sparqlRepo + '/per-lod-ad-astra.sources.json?' + (new Date()).toUTCString)
    .then(r => r.json())
    .then(src => {
      const ploaGroupSubject = subjectBronField.appendChild(document.createElement('optgroup'))
      const ploaGroupObject = objectBronField.appendChild(document.createElement('optgroup'))
      ploaGroupSubject.label = "Per LOD ad Astra Bronnen"
      ploaGroupObject.label = "Per LOD ad Astra Bronnen"
      src.forEach(bron => {
        ploaGroupSubject.appendChild(new Option(bron.naam))
        ploaGroupObject.appendChild(new Option(bron.naam))
      })
    })
    .then(_ => bronnen())
    .then($bronnen => {
      const ndeGroupSubject = subjectBronField.appendChild(document.createElement('optgroup'))
      const ndeGroupObject = objectBronField.appendChild(document.createElement('optgroup'))
      ndeGroupSubject.label = "NDE Termennetwerk"
      ndeGroupObject.label = "NDE Termennetwerk"
      $bronnen.forEach(bron => {
        ndeGroupSubject.appendChild(new Option(bron.name, bron.uri))
        ndeGroupObject.appendChild(new Option(bron.name, bron.uri))
      });
      if (debug) subjectBronField.selectedIndex = 1
      if (debug) objectBronField.selectedIndex = 1
    }).then(_ => {
      document.querySelector('.spinner').classList.add('hidden')
      document.querySelector('.app').classList.remove('hidden')
    })

  const queryField = document.getElementById('query')
  if (debug) queryField.value = 'gouda'
  const subjectBronField = document.getElementById('subjectBron')
  const objectBronField = document.getElementById('objectBron')
  const alert = document.querySelector('div.alert-warning')
  const table = document.querySelector('table')
  const tbody = table.querySelector('tbody');

  [queryField, subjectBronField, objectBronField].forEach(el => {
    el.onchange = () => {
      if (queryField.value !== '' && subjectBronField.selectedIndex !== 0 && objectBronField.selectedIndex !== 0 ) {
        document.getElementById('btnSearch').disabled = false
      } else {
        document.getElementById('btnSearch').disabled = true
      }
    }
  })

  document.querySelector('form').onsubmit = (ev) => {
    ev.preventDefault()
    document.querySelector('.alert-light')?.classList.add('hidden')
    if (!queryField.value) alert('Vul eerst een zoekopdracht in!')
    else if(subjectBronField.selectedIndex === 0) alert('Selecteer eerst een bron bij "Bron 1"!')
    else if(objectBronField.selectedIndex === 0) alert('Selecteer eerst een bron bij "Bron 2"!')
    else {
      document.querySelector('.spinner2').classList.remove('hidden')
      table.classList.add('hidden')


      zoek(queryField.value, subjectBronField.options[subjectBronField.selectedIndex])
        .then(terms => terms[0])
        .then(async termsSubject => {
          var termsObject = []
          if (
            subjectBronField.options[subjectBronField.selectedIndex]
            == 
            objectBronField.options[objectBronField.selectedIndex]
          ) {
            termsObject = termsSubject
          } else {
            termsObject = await zoek(queryField.value, objectBronField.options[objectBronField.selectedIndex])
              .then(terms => terms[0])
          }
          const objectSelectList = () => {
            const li = []
            for (let term of termsObject) {
              li.push(`<li><a class="dropdown-item" href="#" data-uri="${term.uri}">${term.prefLabel}</a></li>`)
            }
            const html = `
  <a class="btn btn-primary dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
    selecteer doel-link
  </a>
  <ul class="dropdown-menu">
    ${li.join('')}
  </ul>
`
            const div = document.createElement('div')
            div.classList.add('dropdown')
            div.innerHTML = html
            return div
          }

          const predicateSelectList = () => {
            const select = document.createElement('select')
            select.classList.add('form-select', 'predicate')
            select.add(new Option('owl:sameAs', 'http://www.w3.org/2002/07/owl#sameAs'))
            select.add(new Option('rdfs:seeAlso', 'http://www.w3.org/2000/01/rdf-schema#'))
            select.add(new Option('sdo:about', 'https://schema.org/about'))
            select.add(new Option('sdo:subjectOf', 'https://schema.org/subjectOf'))
            return select
          }

          tbody.innerHTML = ''
          document.getElementById('toRdf').disabled = true
          if (!termsSubject || termsSubject.length === 0) {
            alert.classList.remove('hidden')
            table.classList.add('hidden')
          } else {
            alert.classList.add('hidden')
            table.classList.remove('hidden')
          }

          let rowNum = 0
          termsSubject.forEach(term => {
            const row = document.createElement('tr')
            row.appendChild(document.createElement('th')).innerText = ++rowNum
            tbody.appendChild(row)
            var cell = row.appendChild(document.createElement('td'))
            cell.innerHTML = `
            <span class="prefLabel">${term.prefLabel}</span><br>
            <a class="uri" href="${term.uri}">${term.uri}</a>
            `
            row.appendChild(cell)
            cell = row.appendChild(document.createElement('td'))
            cell.appendChild(predicateSelectList())
            if (termsObject.length === 0) {
              if(rowNum === 1) {
                cell = row.appendChild(document.createElement('td'))
                cell.rowSpan = termsSubject.length
                const msg = cell.appendChild(document.createElement('div'))
                msg.innerHTML = `geen resultaat gevonden in de bron<br>"<strong>${objectBronField.options[objectBronField.selectedIndex].text}</strong>"`
                msg.classList.add('alert')
                msg.classList.add('alert-warning')
              }

            } else {
              cell = row.appendChild(document.createElement('td'))
              cell.appendChild(objectSelectList())
            }
          })
          const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
          [...dropdownElementList].map(dropdownToggleEl => new bootstrap.Dropdown(dropdownToggleEl));
          // const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
          // const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))

          document.querySelectorAll('a.dropdown-item').forEach(a => a.onclick = (ev) => {
            ev.preventDefault()
            document.getElementById('toRdf').disabled = false
            ev.target.parentNode.parentNode.parentNode.innerHTML = `
            <span class="prefLabel">${ev.target.innerHTML}</span><br>
            <a class="uri" href="${ev.target.dataset.uri}">${ev.target.dataset.uri}</a>
            `
          })
          document.querySelector('.spinner2').classList.add('hidden')
          tbody.classList.remove('hidden')

        })
        .catch(e => {
          window.alert('Helaas ging er iets mis...')
        })

    }
  }

  document.getElementById('toRdf').onclick = (ev) => {
    ev.preventDefault()
    if (table.classList.contains('hidden')) {
      window.alert('U hebt nog geen relaties gemaakt.')
    } else {
      const triples = []
      document.querySelectorAll('tr').forEach(tr => {
        const cells = tr.querySelectorAll('td')
        const subject = cells.item(0)?.querySelector('a').href
        const subjectName = cells.item(0)?.querySelector('span.prefLabel')?.innerText.replaceAll('"', '\\"')
        const pList = cells.item(1)?.querySelector('select')
        var predicate
        if (pList) {
          predicate = pList.options[pList.selectedIndex].value
        }
        const object = cells.item(2)?.querySelector('a:not(.dropdown-item):not(.btn)')?.href
        const objectName = cells.item(2)?.querySelector('span.prefLabel')?.innerText?.replaceAll('"', '\\"')
        if (subject && predicate && object) {
          triples.push(`<${subject}> <${predicate}> <${object}> .`)
          triples.push(`<${subject}> <https://schema.org/name> "${subjectName}" .`)
          triples.push(`<${object}> <https://schema.org/name> "${objectName}" .`)
        }
      })
      if (triples.length === 0) {
        window.alert('U hebt nog geen relaties gemaakt.')
      } else {
        fetch('./post.nt.php', {
          method:'POST',
          body: triples.join('\n')
        }).then(res => res.text())
        .then(_ => {
          document.querySelector('.alert-success').classList.remove('hidden')
          table.classList.add('hidden')
          document.getElementById('toRdf').disabled = true
        })
        .then(_ => download('relaties.nt', triples.join('\n')))
        .then(_ => window.setTimeout(() => {document.querySelector('.alert-success').classList.add('hidden')}, 5000))
      }
    }
  }
}
const zoek = async (term, option) => {
  if(option.value, option.innerText) {
    return PLaASearch(term, option)
  }
  const api = option.value
  const body = { 
    "query": 
`query Terms ($sources: [ID]!, $query: String!) {
  terms (sources: $sources query: $query queryMode: OPTIMIZED) {
    source {
      name
      uri
      alternateName
      description
      creators {
        name
        alternateName
      }
    }
    result {
      ... on Terms {
        terms {
          uri
          prefLabel
          altLabel
          hiddenLabel
          scopeNote
          seeAlso
        }
      }
      ... on Error {
        __typename
        message
      }
    }
  }
}`,
  variables:{
    sources:[api],
    query:term
  }
}
  const res = await fetch("https://termennetwerk-api.netwerkdigitaalerfgoed.nl/graphql",
    {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      "method": "POST",
    }
  );
  return (await res.json()).data.terms
    .map(res => res.result.terms)
}

const bronnen = async () => {
  const res = await fetch("https://termennetwerk-api.netwerkdigitaalerfgoed.nl/graphql", {
    "body": "{\"query\":\"query Sources { sources { name uri } }\"}",
    "headers": {
      "Content-Type": "application/json"
    },
    "method": "POST",
    "mode": "cors",
    "redirect": "follow"
  })
  return (await res.json()).data.sources

}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:application/n-triples;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

const PLaASearch = async (term, option) => 
  fetch(sparqlRepo + '/per-lod-ad-astra.sources.json')
    .then(r => r.json())
    .then(s => s.filter(s => s.naam===option.value).pop())
    .then(async bron => {
      const rq = await fetch(sparqlRepo + bron.query + '?' + (new Date()).toUTCString()).then(r => r.text()).then(rq => rq.replace('?zoekopdracht', `"${term}"`))
      return fetch(bron.endpoint, {
          "body": `query=${encodeURIComponent(rq)}`,
          "headers": {
              "Accept": "application/n-triples",
              "Content-Type": "application/x-www-form-urlencoded",
          },
          "method": "POST"
      })
      .then(rs => rs.text())
      .then(nt => {
        const triples = new Map();
        nt.split("\n").forEach(triple => {
          let s, p, o
          [s, p, ...o] = triple.replace(/ ?\.$/, '').split(' ')
          o = o.join(' ').replace(/^[\<"](.+(?=["\>]$))["\>]$/, '$1');
          if (o.endsWith('"')) o = o.substring(0, o.length-2)
          if (o.startsWith('"')) o = o.substring(1)
          if (!triples.has(s)) triples.set(s, {prefLabel: '', uri: ''})
          if (p === '<https://schema.org/name>') {
            triples.get(s).prefLabel = o.replaceAll('\\"', '"')
          }
          else if (p === '<https://schema.org/about>') triples.get(s).uri = o
        })
        const terms= []
        triples.forEach(term => {
          if (term.prefLabel && term.uri)
            terms.push({prefLabel: term.prefLabel, uri: term.uri})
        })
        return [terms]
      })
    })


const swapBronnen = (ev) => {
  ev.preventDefault()
  const subjectBronField = document.getElementById('subjectBron')
  const objectBronField = document.getElementById('objectBron')
  const ix1 = subjectBronField.selectedIndex
  const ix2 = objectBronField.selectedIndex
  subjectBronField.selectedIndex = ix2
  objectBronField.selectedIndex = ix1
}