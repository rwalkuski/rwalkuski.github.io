class Plotwindow(threading.Thread):
    def __init__(self,frame,title,path):
        threading.Thread.__init__(self)
        self.x = df.loc[df['Address']==frame] 
        self.y = self.x[['TimeStamp','Data0','Data1','Data2','Data3','Data4','Data5','Data6','Data7']]
        self.y[['TimeStamp','Data0','Data1','Data2','Data3','Data4','Data5','Data6','Data7']].plot(x='TimeStamp',title=title+'\nNaciśnij na linię na legendzie, aby ukryć',drawstyle='steps-post')
        self.maxes = self.y.astype(int).agg([min,max]).iloc[:,1:].values.tolist()
        self.ticks2 = list(filter(lambda a: a != -1, self.maxes[0]+self.maxes[1]))
        self.plt = plt
        self.plt.get_current_fig_manager().set_window_title(frame+' - '+path)
        self.ax = self.plt.gca()
        self.fig = self.plt.gcf()
        self.plt.yticks(ticks=self.ticks2)
        self.ylabels = map(lambda t: '0x%02X' % int(t)+'('+str(t)+')', self.ax.get_yticks())
        self.ax.set_yticklabels(self.ylabels)
        self.plt.grid(True)
        self.leg = self.ax.legend(loc='upper left', fancybox=True, shadow=True)
        self.lines = self.ax.get_lines()
        self.lined={}
        for legline, origline in zip(self.leg.get_lines(), self.lines):
            legline.set_picker(5)  # Enable picking on the legend line.
            self.lined[legline] = origline
        self.fig.canvas.mpl_connect('pick_event', self.on_pick)
        self.fig.canvas.draw()

    ##definicja funkcji ukrywania wykresow
    def on_pick(self,event):
        legline = event.artist
        origline = self.lined[legline]
        visible = not origline.get_visible()
        origline.set_visible(visible)
        legline.set_alpha(1.0 if visible else 0.2)
        self.fig.canvas.draw()

plotthread = Plotwindow(frame,frame,foldername[1])
plotlist.append(plotthread)
plotlist[-1].start()
plt.show()
