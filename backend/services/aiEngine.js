/**
 * CyberGuard AI - Intelligent Intrusion Detection Engine
 * Implements anomaly scoring, rule-based feature heuristics, and simulated 
 * ML classification (Random Forest, SVM, Deep Neural Net) based on NSL-KDD & CICIDS2017 features.
 */

export const analyzePacket = (packet) => {
  const {
    source_ip = '',
    destination_ip = '',
    protocol = 'TCP',
    source_port = 0,
    destination_port = 80,
    packet_size = 512,
    flags = ''
  } = packet;

  const destPort = Number(destination_port);
  const size = Number(packet_size);
  const upperProto = (protocol || 'TCP').toUpperCase();
  const upperFlags = (flags || '').toUpperCase();

  let threatType = 'Normal Traffic';
  let severity = 'Low';
  let confidence = 0.96;
  let algorithm = 'Decision Tree Baseline';
  let isThreat = false;
  let recommendedAction = 'Allow and Log';
  let riskScore = 12;

  // 1. DDoS / Flooding detection (Huge packet or SYN flood characteristics)
  if (size > 50000 || (upperFlags.includes('SYN') && size > 15000)) {
    isThreat = true;
    threatType = 'DDoS (SYN / Volumetric Flood)';
    severity = 'Critical';
    confidence = +(0.95 + Math.random() * 0.04).toFixed(2);
    algorithm = 'Deep Neural Network (CICIDS2017 trained)';
    recommendedAction = `Immediate Null-Route & Blacklist Source IP ${source_ip}`;
    riskScore = 95;
  }
  // 2. Sensitive Remote Access & SSH / RDP Brute Force Detection
  else if ((destPort === 22 || destPort === 3389 || destPort === 23) && (upperFlags.includes('SYN') || size > 1400)) {
    isThreat = true;
    threatType = destPort === 22 ? 'SSH Brute Force Attack' : (destPort === 23 ? 'Telnet Vulnerability Probe' : 'RDP Exploit Attempt');
    severity = 'High';
    confidence = +(0.91 + Math.random() * 0.05).toFixed(2);
    algorithm = 'Random Forest Classifier (NSL-KDD trained)';
    recommendedAction = `Block Port ${destPort} Access for IP ${source_ip} & Apply MFA`;
    riskScore = 82;
  }
  // 3. Port Scanning / Reconnaissance Anomaly
  else if (destPort > 40000 || upperFlags.includes('FIN') || upperFlags.includes('NULL') || upperFlags.includes('XMAS')) {
    isThreat = true;
    threatType = 'Stealth Port Scanning / Recon Probe';
    severity = 'Medium';
    confidence = +(0.86 + Math.random() * 0.06).toFixed(2);
    algorithm = 'Support Vector Machine (UNSW-NB15 trained)';
    recommendedAction = `Rate-limit subnet and flag IP ${source_ip} on Perimeter Firewall`;
    riskScore = 65;
  }
  // 4. Web Application Attack / SQLi / Path Traversal simulation
  else if ([80, 8080, 3000].includes(destPort) && (upperFlags.includes('PSH') && size > 4000)) {
    isThreat = true;
    threatType = 'Malicious Web Exploit / Injection Payload';
    severity = 'High';
    confidence = +(0.93 + Math.random() * 0.04).toFixed(2);
    algorithm = 'Artificial Neural Network (CICIDS2017)';
    recommendedAction = `Trigger Web Application Firewall (WAF) Rule for ${source_ip}`;
    riskScore = 88;
  }
  // 5. Botnet / Unusual UDP Amplification
  else if (upperProto === 'UDP' && size > 2048) {
    isThreat = true;
    threatType = 'UDP Reflection / Botnet Amplification';
    severity = 'High';
    confidence = +(0.89 + Math.random() * 0.05).toFixed(2);
    algorithm = 'K-Nearest Neighbor (KNN Anomaly Detector)';
    recommendedAction = `Drop UDP ingress packets from ${source_ip}`;
    riskScore = 78;
  }
  else {
    // Normal benign traffic
    isThreat = false;
    threatType = 'Benign / Legitimate Traffic';
    severity = 'Low';
    confidence = +(0.95 + Math.random() * 0.04).toFixed(2);
    algorithm = 'Random Forest Classifier (NSL-KDD Baseline)';
    recommendedAction = 'Allow session connection without interception';
    riskScore = Math.floor(5 + Math.random() * 15);
  }

  return {
    is_threat: isThreat,
    threat_type: threatType,
    severity: isThreat ? severity : 'Low',
    confidence_score: confidence,
    risk_score: riskScore,
    algorithm_used: algorithm,
    recommended_action: recommendedAction,
    analyzed_at: new Date().toISOString()
  };
};
