#CSR2 MS solver for CSR2XLx.xx
def scinot(xxc, xxce): #Fixes scientific notation e.g. 12e10 to 1.2e11
  while xxc > 10:
    xxce += 1
    xxc = xxc / 10
  return xxc, xxce
def upscinot(xxc, xxce): #fixes scientific notation e.g. 0.12e12 to 1.2e11
  while xxc < 1:
    xxce -= 1
    xxc = xxc * 10
  return xxc, xxce
def power(xx, xxc, xxce, multi): #calculates the costs of variables (level, cost, coste, multi)
  while xx > 0:
    xx -= 1
    xxc *= multi
    xxc, xxce = scinot(xxc, xxce)
  return xxc, xxce

#YOUR CURRENT RATIO FOUND IN THE CSR2XL x.xx STRAT
ratio = int(input('What is your current ratio (Found in your strat): '))

#YOU CURRENT LEVELS OF EACH VARIABLE
print('Enter you current level for each variable')
q1 = int(input('q1: '))
q2 = int(input('q2: '))
c1 = int(input('c1: '))
n = int(input('n:  '))
c2 = int(input('c2: '))

#CONSTANTS DO NOT EDIT
q1c = 1
q1ce = 1
q2c = 1.5
q2ce = 1
c1c = 1
c1ce = 6
nc = 5
nce = 1
c2c = 1
c2ce = 3

#WORKING OUT COSTS
q1c, q1ce = power(q1-1, q1c, q1ce, 5)
q2c, q2ce = power(q2, q2c, q2ce, 128)
c1c, c1ce = power(c1, c1c, c1ce, 16)  
nc, nce = power(n, nc, nce, 256**3.346)
c2c, c2ce = power(c2, c2c, c2ce, 10**5.65)
  
while True:
  
  #min(q2, n, c2) = non1 * 10 ^ non1e
  #calculation for non1 and non1e
  non1e = min(q2ce, nce, c2ce)
  non1 = min(q2c, nc, c2c)
  if q2ce > non1e and q2c == non1:
    non1 = min(nc, c2c)
    if nc > non1e and nc == non1:
      non1 = c2c
    if c2ce > non1e and c2c == non1:
      non1 = nc
      
  elif nce > non1e and nc == non1:
    non1 = min(q2c, c2c)
    if c2ce > non1e and c2c == non1:
      non1 = q2c
    if q2c > non1e and q2c == non1:
      non1 = c2c
    
  elif c2ce > non1e and c2c == non1:
    non1 = min(q2c, nc)
    if q2c > non1e and q2c == non1:
      non1 = nc
    if nc > non1e and nc == non1:
      non1 = q2c
    
  #q1b and c1b are weather or not to buy q/c1 if you can afford it.
  #This is calculated off of non1 so it had to be calculated above
  if q1ce + 1 < non1e:
    q1b = True
  elif q1ce + 1 == non1e:
    if q1c < non1:
      q1b = True
    else:
      q1b = False
  else:
    q1b = False
    
  if c1ce + 1 < non1e:
    c1b = True
  elif c1ce + 1 == non1e:
    if c1c < non1:
      c1b = True
    else:
      c1b = False
  else:
    c1b = False

  #This calculates what to buy next, by having you buy the cheapest one that you should buy*
  # *as in "Don't buy q1 if q2 costs 2x q1"
  #mn is the cost of the whay you should buy next, mnn is its name
  if q1b == True and c1b == True:
    mne = min(q1ce, q2ce, c1ce, nce, c2ce)
  elif q1b == False and c1b == True:
    mne = min(q2ce, c1ce, nce, c2ce)
  elif q1b == True and c1b == False:
    mne = min(q1ce, q2ce, nce, c2ce)
  else:
    mne = min(q2ce, nce, c2ce)
  mn = 10
  if q1ce == mne and q1b == True:
    mn = q1c
    mnn = 'q1'
  if q2ce == mne and q2c < mn:
    mn = q2c
    mnn = 'q2'
  if c1ce == mne and c1c < mn and c1b == True:
    mn = c1c
    mnn = 'c1'
  if nce == mne and nc < mn:
    mn = nc
    mnn = 'n'
  if c2ce == mne and c2c < mn:
    mn = c2c
    mnn = 'c2'
  
  
  print('[1] q1 lvl: ' + str(q1) + ' '*(4 - len(str(q1))) + '| cost: ' + str(round(q1c, 2)) + 'e' + str(q1ce) + ' | on: ' + str(q1b))
  print('[2] q2 lvl: ' + str(q2) + ' '*(4 - len(str(q2))) + '| cost: ' + str(round(q2c, 2)) + 'e' + str(q2ce))
  print('[3] c1 lvl: ' + str(c1) + ' '*(4 - len(str(c1))) + '| cost: ' + str(round(c1c, 2)) + 'e' + str(c1ce) + ' | on: ' + str(c1b))
  print('[4] n  lvl: ' + str(n)  + ' '*(4 - len(str(n)))  + '| cost: ' + str(round(nc, 2))  + 'e' + str(nce) )
  print('[5] c2 lvl: ' + str(c2) + ' '*(4 - len(str(c2))) + '| cost: ' + str(round(c2c, 2)) + 'e' + str(c2ce))
  print('Next: ' + mnn)
  
  #MILESTONE SWAPPING CODE
  pa, pae = upscinot(c2c / ratio, c2ce)
  pb, pbe = upscinot(2 * nc / ratio, nce)
  if pae > pbe:
    swap, swape = pb, pbe
  elif pbe > pae:
    swap, swape = pa, pae
  else:
    swape = pae
    if pa < pb:
      swap = pa
    else:
      swap = pb
  print('Swap point (RECOVERY): ' + str(round(swap,2)) + 'e' + str(swape))
  
  pd, pde = swap, swape
  pc, pce = upscinot(q2c / 2, q2ce)
  if pde > pce:
    swap, swape = pc, pce
  elif pce > pde:
    swap, swape = pd, pde
  else:
    swape = pce
    if pc < pd:
      swap = pc
    else:
      swap = pd
  print('Swap point (TAU GAIN): ' + str(round(swap,2)) + 'e' + str(swape))
  
  #Takes input
  go = input('')
  if go == '0':
    go = mnn
  if go == 'q1' or go == '1':
    q1 += 1
    q1c *= 5
    q1c, q1ce = scinot(q1c, q1ce)
  if go == 'q2' or go == '2':
    q2 += 1
    q2c *= 128
    q2c, q2ce = scinot(q2c, q2ce)
  if go == 'c1' or go == '3':
    c1 += 1
    c1c *= 16
    c1c, c1ce = scinot(c1c, c1ce)
  if go == 'n' or go == '4':
    n += 1
    nc *= 256**3.346
    nc, nce = scinot(nc, nce)
  if go == 'c2' or go == '5':
    c2 += 1
    c2c *= 10**5.65
    c2c, c2ce = scinot(c2c, c2ce)
