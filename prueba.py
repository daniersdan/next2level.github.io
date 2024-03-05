from bokeh.sampledata.autompg import autompg_clean as df
import hvplot.pandas
import panel as pn
import holoviews as hv
hv.extension('bokeh')
pn.extension('tabulator')
PALETTE = ["#ff6f69", "#ffcc5c", "#88d8b0", ]

idf = df.interactive()

cylinders = pn.widgets.IntSlider(name='Cylinders', start=4, end=8, step=2)
mfr = pn.widgets.ToggleGroup(
    name='MFR',
    options=['ford', 'chevrolet', 'honda', 'toyota', 'audi'], 
    value=['ford', 'chevrolet', 'honda', 'toyota', 'audi'],
    button_type='success')
yaxis = pn.widgets.RadioButtonGroup(
    name='Y axis', 
    options=['hp', 'weight'],
    button_type='success'
)

ipipeline = (
    idf[
        (idf.cyl == cylinders) & 
        (idf.mfr.isin(mfr))
    ]
    .groupby(['origin', 'mpg'])[yaxis].mean()
    .to_frame()
    .reset_index()
    .sort_values(by='mpg')  
    .reset_index(drop=True)
)

ihvplot = ipipeline.hvplot(x='mpg', y=yaxis, by='origin', color=PALETTE, line_width=6)

template = pn.template.FastListTemplate(
    title='Interactive DataFrame Dashboards with hvplot .interactive', 
    sidebar=[cylinders, 'Manufacturers', mfr, 'Y axis' , yaxis],
    main=[ihvplot.panel()],
    accent_base_color="#88d8b0",
    header_background="#88d8b0",
)

print(x)

