//Script criado por dark (17991134416)

//O que tem:
 // * esse script automatiza o envio de mensagens no site omegle, funcionando tanto em android, tanto em pc, na versao pc ele consegue identificar se caiu recaptcha e resolve-lo, ele tambem identifica se o bot caiu na blacklist do site.
     // Abra a pagina: https://localhost:3000
      // * la você verá o painel do bot

const express = require('express');
const axios = require("axios")
const app = express();
const path = require("path")
const fs = require("fs")
const delay = require("delay")
const { exec } = require('child_process');

//INFORME SE VOCE VAI USAR EM "ANDROID" OU "PC"

const versao = "pc" //pc por padrao, mude para android se for usar no termux.

//INFORME AS MENSAGENS:
  const mensagens = [
       "Oi, tudo bem?",
       "Me segue no insta la!",
       "@higorkkjx"        
            ];



blacklistBAN = false
currentTimestamp = "";
finaltime = "";
tentativas = 0
safeMod = false
solving = false
tempo_atual = 0
let delayMsg = 50

if (versao == "pc") {
     var puppeteer = require("puppeteer")
     var solve = require(path.join(__dirname, 'puppeteer-recaptcha-solver/index.js'));
}

try {
    UserDB = JSON.parse(fs.readFileSync("dados.json"));
} catch (e) {
    console.log("Erro ao encontrar o arquivo dados.json", e);
}


if (safeMod == false) {
  var botmode = "rapido"
 } else if (safeMod == true) {
   var botmode = "seguro"
 }

 let speed = []

let data = {
    "chats": 0,
    "modo": botmode,
    "mensagem": "",
    "recaptchas": 0,
    "resolvidos": 0,
    "status": "",
    "velocidade": 0,
    "media": 0
    }
    

    const addChat = () => {
    data.chats++;
    fs.writeFile(path.join(__dirname, 'dados.json'), JSON.stringify(data), 'utf8', (err) => {
    if (err) throw err;
    });
    }

    const setMedia = (number) => {
      data.media = number;
      fs.writeFile(path.join(__dirname, 'dados.json'), JSON.stringify(data), 'utf8', (err) => {
      if (err) throw err;
      console.log('velocidade modificada');
      });
      }

    function getMedia(arr) { //OBTENDO A MEDIA DE VELOCIDADE
      let sum = 0;
      for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
      }
      var mediaGet = Math.round((sum / arr.length) * 100) / 100;
       setMedia(mediaGet)
    }

  
    const setStatus = (status) => {
        data.status = status
        fs.writeFile(path.join(__dirname, 'dados.json'), JSON.stringify(data), 'utf8', (err) => {
        if (err) throw err;
        });
        }

    const addCaptcha = () => {
        data.recaptchas++;
        fs.writeFile(path.join(__dirname, 'dados.json'), JSON.stringify(data), 'utf8', (err) => {
        if (err) throw err;
        });
        }

        const addSolves = () => {
          data.resolvidos++;
          fs.writeFile(path.join(__dirname, 'dados.json'), JSON.stringify(data), 'utf8', (err) => {
          if (err) throw err;
          });
          }
    
    const setUltimaMensagem = (msg) => {
    data.mensagem = msg;
    fs.writeFile(path.join(__dirname, 'dados.json'), JSON.stringify(data), 'utf8', (err) => {
    if (err) throw err;
    console.log('mensagem modificada');
    });
    }

    const setMetodo = (msg) => {
      metodo = msg;
      console.log('metodo modificado');
      }
  

    const setvelocidade = (number) => { //MOSTRANDO O QUANTO O CHAT ATUAL DUROU (POR EXEMPLO: O BOT DEMOROU 3s PARA ENVIAR TODAS AS MENSAGENS E DESCONECTAR DO CHAT NUMERO 1... A VELOCIDADE VARIA.)
        data.velocidade = number;
        fs.writeFile(path.join(__dirname, 'dados.json'), JSON.stringify(data), 'utf8', (err) => {
        if (err) throw err;
        console.log('velocidade modificada');
        });
        }
    
    app.get('/api-dados', (req, res) => {
    res.json(data);
    });
    app.get('/addchat', (req, res) => {
    addChat();
    res.send("+1")
    });

    app.get('/addcap', (req, res) => {
        addCaptcha();
        res.send("+1")
        });
    
    app.get('/addmsg/:msg', (req, res) => {
    setUltimaMensagem(req.params.msg);
    res.send("Ultima mensagem atualizada!")
    });

    app.get('/metodo/:msg', (req, res) => {
  
      metodo = req.params.msg
      if (metodo == "axios") {
        startChatBot(100000, "axios")
      } else {
    startChatBot(100000, "puppeteer")
      }

      res.send("metodo setado!")
      });

    app.get('/modo/:msg', (req, res) => { //VARIANDO OS MODOS (RAPIDO - SEGURO)
      if (req.params.msg == "rapido") {
        data.modo = "Rapido"
        fs.writeFile(path.join(__dirname, 'dados.json'), JSON.stringify(data), 'utf8', (err) => {
        })
        safeMod = false
        res.send("Modo rapido ativado")
      } else if (req.params.msg == "seguro") {
        data.modo = "Seguro"
        fs.writeFile(path.join(__dirname, 'dados.json'), JSON.stringify(data), 'utf8', (err) => {
        })
        safeMod = true
        res.send("Modo seguro ativado")
      }
      });

      app.get('/', (req, res) => { //PAGINA INICIAL
        res.send(`
        <h1>Escolha o metodo e acesse o painel</h1>
        <div>
            <button id="metodo-axios" onclick="axiosM()">Modo Android e pc (funciona em ambos)</button>
            <button id="metodo-puppeteer" onclick="puppM()">Modo Pc (funciona apenas em pc)</button>
            <button id="acessar-painel" onclick="redirectToPainel()">Acessar Painel</button>
        </div>
        
        <style>
        #metodo-axios, #metodo-puppeteer, #acessar-painel {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 50px auto; /* Adicionando uma margem automática ao redor dos botões */
      }
      
      button {
          background-color: red;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          font-size: 18px;
          cursor: pointer;
          margin-right: 10px; /* Removendo essa margem para deixar os botões mais próximos */
          transition: all 0.2s ease-in-out; /* Adicionando uma transição suave ao hover */
      }
      
      #acessar-painel {
        background-color: blue;
      }

      button:hover {
          transform: scale(1.1); /* Aumentando o tamanho do botão quando o cursor passa por cima */
      }
      
      h1 {
          text-align: center;
          margin-top: 50px;
          font-size: 24px;
          font-weight: bold;
      }
      
        </style>
        <script>
        function redirectToPainel() {
          window.location.href = '/painel';
        }
          function axiosM() {
             window.location.replace("/painel");
            fetch("/metodo/axios")
              .then(response => {
                if (response.ok) {
                  return response.json();
                } else {
                  throw new Error("Error fetching data");
                }
              })
              .then(data => {
                console.log(data);
         
              })
              .catch(error => {
                console.error(error);
              });
          }
          function puppM() {
            window.location.replace("/painel");
            fetch("/metodo/puppeteer")
              .then(response => {
                if (response.ok) {
                  return response.json();
                } else {
                  throw new Error("Error fetching data");
                }
              })
              .then(data => {
                console.log(data);
               
              })
              .catch(error => {
                console.error(error);
              });
          }
        </script>
      `);
      
      })

app.get('/painel', (req, res) => { //PAINEL
    res.send(`
    <div id="status"></div>
        <div id="chats"></div>
        <div id="media"></div>
        <div id="ultima-mensagem"></div>
        <div id="recaptchas"></div>
        <div id="solves"></div>
        <div id="velocidade"></div>
        <div id="modo"></div>
        
        <button id="modo-rapido" onclick="modoRapido()">Modo Rápido</button>
<button id="modo-seguro" onclick="modoSeguro()">Modo Seguro</button>


<style>
body {
  background-color: #f2f2f2;
  font-family: Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
}

#status, #chats, #ultima-mensagem, #recaptchas, #solves, #velocidade, #modo, #media {
  margin: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0px 0px 5px #ccc;
  font-size: 18px;
}

#status {
  background-color: #f9f9f9;
}

#chats {
  background-color: #f0f0f0;
}

#ultima-mensagem {
  background-color: #e5e5e5;
}

#recaptchas {
  background-color: #e5e5e5;
}

#solves {
  background-color: #e5e5e5;
}

#modo {
  background-color: #f9f9f9;
}

#velocidade {
  background-color: #f9f9f9;
}

#media {
  background-color: #f9f9f9;
}

button {
  background-color: red;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  margin-right: 10px;
}

h1 {
  text-align: center;
  margin-top: 50px;
  font-size: 24px;
  font-weight: bold;
}
</style>

        <script>
            setInterval(() => {
             
                fetch("/api-dados")
                    .then(response => response.json())
                    .then(data => {
                        console.log(data.chats);
                        document.getElementById("status").innerHTML = \`Status: \${data.status}\`;
                        document.getElementById("chats").innerHTML = \`Total de chats: \${data.chats}\`;
                        document.getElementById("modo").innerHTML = \`Modo: \${data.modo}\`;
                        document.getElementById("velocidade").innerHTML = \`Velocidade atual: \${data.velocidade} segundos\`;
                        document.getElementById("media").innerHTML = \`Média de velocidade: \${data.media} segundos\`;
                        document.getElementById("ultima-mensagem").innerHTML = \`Ultima mensagem recebida: \${data.mensagem}\`;
                        document.getElementById("recaptchas").innerHTML = \`Recaptchas caidos: \${data.recaptchas}\`;
                        document.getElementById("solves").innerHTML = \`Recaptchas resolvidos: \${data.resolvidos}\`;

                    });
            }, 1000);

            function modoRapido() {
              fetch("/modo/rapido")
                .then(response => response.json())
                .then(data => {
                  console.log(data);
                });
            }
          
            function modoSeguro() {
              fetch("/modo/seguro")
                .then(response => response.json())
                .then(data => {
                  console.log(data);
                });
            }

        </script>
    `);
});

app.listen(3000, () => {
  if (versao == "pc") {
    exec(`start chrome http://localhost:3000`);
  } else {
    console.log(`Abra o site: http://localhost:3000\n\nE configure o script!`)
  }

});


const resolverCaptcha = async() => { //FUNÇÃO DE RESOLVER RECAPTCHA (DISPONIVEL SOMENTE PRA PC)
  solving = true
  let browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-web-security', '--disable-features=IsolateOrigins', ' --disable-site-isolation-trials']});
    let page;
    page = await browser.newPage();
    let client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.clearBrowserCache');
    await page.goto('https://omegle.com');
    await page.click("#textbtn", {delay: 10});
    await page.click("body > div:nth-child(11) > div > p:nth-child(2) > label > input[type=checkbox]", {delay: 10});
    await page.click("body > div:nth-child(11) > div > p:nth-child(3) > label > input[type=checkbox]", {delay: 10});
    await page.click("body > div:nth-child(11) > div > p:nth-child(4) > input[type=button]", {delay: 10});
    await delay(3000)
    async function checkForRecaptcha(page) {
      // procurando pelo iframe api2/anchor
      const iframe = await page.frames().find(f => f.url().includes("api2/anchor"));
      // Verifica se o elemento com o ID "recaptcha-anchor" está presente no iframe
      if (iframe) {
        const recaptcha = await iframe.$("#recaptcha-anchor");
        if (recaptcha) {
          console.log("Recaptcha encontrado na página");
          return true;
        }
      }
      console.log("Recaptcha não encontrado na página");
      return false;
    }

   
  var checkcap = await checkForRecaptcha(page)
  if (checkcap == true) {
   var resolver = await solve(page)
  if (resolver == true) {
    console.log("Recaptcha Resolvido!")
    solving = false
    await addSolves()
    await browser.close()
    currentTimestamp = new Date().getTime();
  } else {
    console.log("Recaptcha não Resolvido!")
    solving = false
    await browser.close()
   currentTimestamp = new Date().getTime();
  }

  }

}

const blacklist = async() => { //FUNÇÃO DE CHECAR BLACKLIST (DISPONIVEL SOMENTE PRA PC)
  const difference = finaltime - currentTimestamp;
  if (difference < 60 * 1000) {
    console.log("blacklist");
    blacklistBAN = true
    return true
  } else {
    console.log("sem blacklist"); 
    blacklistBAN = false
    return false
  }
}



id_sessao = "" // ID da sessão atual
chatsss = 0 // Variavel de contagem de chats

// Servidores disponíveis para conexão
const servers = [
  "front1",
  "front2",
  "front3",
  "front4",
  // ...
];
// Função para enviar uma mensagem para o parceiro de bate-papo
const sendMessage = async (msg, id, sv) => {
  try {
    await axios.post(`https://${sv}.omegle.com/send`, `msg=${msg}&id=${id}`).then(r => {
      console.log(`[${r.data}] Mensagem enviada: ${msg}`);
    })
    
  } catch (error) {
    console.error("Erro ao enviar mensagem: ", error);
  }
};

const newchat = async() => {
    const endTime = performance.now();
    const elapsedSeconds = (endTime - tempo_atual) / 1000;
    console.log(`Tempo de demora: ${elapsedSeconds} segundos`);
    setvelocidade(`${elapsedSeconds}`)
    speed.push(elapsedSeconds)
   await getMedia(speed)
    chatsss += 1
    await addChat()
}

// Função para desconectar do bate-papo atual
const disconnect = async (id, sv) => {
  try {
    await axios.post(`https://${sv}.omegle.com/disconnect`, `id=${id}`);
    console.log("Desconectado do bate-papo atual");
    await newchat()
  } catch (error) {
    console.error("Erro ao desconectar: ", error);
  }
};

// Função para simular a digitação do bot
const typing = async (id, sv) => {
  try {
    await axios.post(`https://${sv}.omegle.com/typing`, `id=${id}`);
    console.log("Bot está digitando...");
  } catch (error) {
    console.error("Erro ao simular digitação: ", error);
  }
};

// Função para obter eventos da sessão atual
const getEvents = async (id, sv) => {
  try {
    const response = await axios.post(`https://${sv}.omegle.com/events`, `id=${id}`);

    return response.data;
  } catch (error) {
    console.error("Erro ao obter eventos: ", error);
    return null;
  }
};


const getMessagesFromUser = async (sessionId, server) => {
    let messages = ""
    let events = await getEvents(sessionId, server);
    textCod = events + ",final"
    if (textCod.includes("gotMessage")) {
        await setUltimaMensagem(events[0][1])
            messages += `${events[0][1]}`
      }
      
    return messages;
};



// Função principal do bot
const startChatBot = async (chats, metodo) => {


   await axios.post("https://waw3.omegle.com/check").then(r => {
     id_sessao += `${r.data}`
})
    let i = 0;
    
    // Loop infinito para manter o bot conectado e processando eventos
    while (i < chats) {

      if (metodo == undefined) {
        console.clear()
        console.log(`Abra o site https://localhost:3000\nE escolha o metodo que a aplicação vai funcionar`)
      } else if (metodo == "axios") {

         try {
           const startTime = performance.now(); 
           tempo_atual = startTime
           falhas = 0
   
       // Inicia uma nova sessão e obtém o ID da sessão
       const server = servers[Math.floor(Math.random() * servers.length)];
       const checkResponse = await axios.get(`https://${server}.omegle.com/start`, {
           params: {
             rcs: 1,
             randid: "YG5MPTNU",
             firstevents: 1,
             caps: "recaptcha2,t3",
             cc: id_sessao,
             lang: "pt",
           }
         })
   
   let databaseTipos = ["waiting", "typing", "connected"]
   //checando se caiu recaptcha
   console.log(checkResponse.data.events[0][0])
   if (checkResponse.data.events[0][0] == "recaptchaRequired") {
           console.clear()
           await addCaptcha()
           await setStatus("Offline") //ativando modo offline
           console.log("Recaptcha exigido!")
           console.log("variavel 1")
           if (versao == "pc") {
   
               if (solving == false) {
                 finaltime = new Date().getTime();
                var checkBlack = await blacklist() // checando se alguma mensagem do bot caiu pra blacklist
                if (!checkBlack == true) {
                 await resolverCaptcha() //resolvendo o recaptcha 
                } else {
                 console.clear()
                 console.log("O sistema de proteção do omegle colocou alguma de suas mensagens na blacklist, e seu IP foi banido!")
               process.exit()
               }
                 
               }
            
           } else {
             console.log("Abra o site omegle e resolva o recaptcha!")
           }
       
         } else {
           if (checkResponse.data.events[0][0] == "strangerDisconnected")  {
           console.log("usuario desconectado!")
           await disconnect(id_sessao, server);
           break;   
         } else {
           console.log(`\nChats: ${chatsss}\nFalhas: ${falhas}\n`)
           await setStatus("Online") //ativando modo online
        
       sessionId = checkResponse.data.clientID;
       const events = await getEvents(sessionId, server);
       console.log(events)
       if (!events) {
           console.log("Erro ao obter eventos, desconectando.");
           await disconnect(id_sessao, server);
           break;   
       }
   
     textCod = events + ",final"
     permissao = false
     if (textCod.includes("connected")) {
       console.log("Conectado a um novo bate-papo");
       permissao = true
     } else if (textCod.includes("gotMessage")) {
       console.log(`Mensagem recebida: ${events[0][1]}`);
       await setUltimaMensagem(events[0][1])
       permissao = true
     } else if (textCod.includes("strangerDisconnected")) {
       console.log("Parceiro de bate-papo desconectado");
       permissao = false
     } else if (textCod.includes("recaptchaRequired")) {
       console.log("Sessão bloqueada por reCAPTCHA. Interrompendo o bot.");
       permissao = false
       return;
     }
   
   
   
     if (safeMod == true) {
       //MODO SEGURO:
       for (let j = 0; j < mensagens.length; j++) {
    // typing(sessionId, server);
          await sendMessage(mensagens[j], sessionId, server);  
      }
      await disconnect(sessionId, server);
   await new Promise(resolve => setTimeout(resolve, 200));
   
     } else {
       //MODO RAPIDO:
       for (let j = 0; j < mensagens.length; j++) {
        // typing(sessionId, server)
             sendMessage(mensagens[j], sessionId, server);
       //await new Promise(resolve => setTimeout(resolve, 50));
        }
   //await new Promise(resolve => setTimeout(resolve, 100));
        await disconnect(sessionId, server);
     }
    
   i++;
   
          }
         
         }
   
   } catch (error) {
     console.error("Erro no loop de bate-papo: ", error);
   }
    
      } else if (metodo == "puppeteer") {
        //MODO NAVEGADOR: 
    

        let browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-web-security', '--disable-features=IsolateOrigins', ' --disable-site-isolation-trials']});
        let page;
        page = await browser.newPage();
        let client = await page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');
        await page.goto('https://omegle.com');
        await page.click("#textbtn", {delay: 10});
        await page.click("body > div:nth-child(11) > div > p:nth-child(2) > label > input[type=checkbox]", {delay: 10});
        await page.click("body > div:nth-child(11) > div > p:nth-child(3) > label > input[type=checkbox]", {delay: 10});
        await page.click("body > div:nth-child(11) > div > p:nth-child(4) > input[type=button]", {delay: 10});
        await delay(4000)

        async function checkForRecaptcha(page) {
          const iframe = await page.frames().find(f => f.url().includes("api2/anchor"));
          if (iframe) {
            const recaptcha = await iframe.$("#recaptcha-anchor");
            if (recaptcha) {
              console.log("Recaptcha encontrado na página");
              await addCaptcha()
              return true;
            }
          }
          console.log("Recaptcha não encontrado na página");
          return false;
        }

        const PageDesconectar = async(page) => {
await page.click('button[class="disconnectbtn"]')
await page.click('button[class="disconnectbtn"]')
await page.click('button[class="disconnectbtn"]')
await newchat()
        }
        while (i < chats) {
          await page.click('button[class="disconnectbtn"]')
          const startTime = performance.now(); 
          tempo_atual = startTime
        

        
      await delay(500)
        var checkcap = await checkForRecaptcha(page)
        if (checkcap == true) {
         var resolver = await solve(page)
        if (resolver == true) {
          console.log("Recaptcha Resolvido!")
          await addSolves()
  
        } else {
          console.log("Recaptcha não Resolvido!")
        }
      
        } else {
        //Sem recaptcha (prosseguindo)
       // await page.waitForSelector(".chatmsg:not([disabled]",{timeout: 10000});
       enviomsgs = true
 ultimaMsg = false
       const disconnected = await page.evaluate(() => {
        return document.querySelector('.statuslog') && document.querySelector('.statuslog').textContent === "Stranger has disconnected.";
    });

    if (disconnected) {
        console.log("Estranho se desconectou, conectando em outro chat");
        // Conectar em outro chat
        await page.click('button[class="disconnectbtn"]')
    }
    try {
    await page.waitForSelector(".chatmsg:not([disabled]",{timeout: 2500});
        for(var numMensaje = 0; numMensaje < mensagens.length; numMensaje++){
          try {
          console.log("=> "+ mensagens[numMensaje])
          ultimaMsg = false
           await  page.type(".chatmsg:not([disabled]", mensagens[numMensaje])
          
          
           await page.click("body > div.chatbox3 > div > div > div.controlwrapper > table > tbody > tr > td.sendbthcell > div > button", {delay: 0.3});
         
           try{ 
            await page.waitForResponse((response) => {
                return response.url().includes('.omegle.com/send');
            }, {timeout: 3000});
         console.log("[API STATUS] => Mensagem enviada")
        }catch{
          console.log("[API STATUS] => Mensagem não enviada")
        }
       
         
          } catch(e) {
            console.log("usuario provavemente desconectado.")
            enviomsgs = false
          }
          }

        if (ultimaMsg == true) {
          await delay(50)
        }
            

          if (enviomsgs == true) {
            await PageDesconectar(page)
          } else {
            await page.click('button[class="disconnectbtn"]')
            await newchat()
          }
              

        } catch(e) {
        console.log("erro")
        }
        }

       
      }
       
    }
     
          }
    
    };
    


  
 